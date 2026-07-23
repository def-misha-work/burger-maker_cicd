import express, {
	type Request,
	type Response,
	type NextFunction,
} from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Логирование запросов с информацией о версии и feature flags
app.use((req, res, next) => {
	const start = Date.now();
	const path = req.path;
	let capturedJsonResponse: Record<string, any> | undefined;

	const originalResJson = res.json;
	res.json = (bodyJson, ...args) => {
		capturedJsonResponse = bodyJson;
		return originalResJson.apply(res, [bodyJson, ...args]);
	};

	res.on("finish", () => {
		const duration = Date.now() - start;
		if (path.startsWith("/api")) {
			let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
			if (capturedJsonResponse) {
				logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
			}

			if (logLine.length > 80) {
				logLine = logLine.slice(0, 79) + "…";
			}

			log(logLine);
		}
	});

	next();
});

// Обработка ошибок с красивыми страницами
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	const status = err.status || err.statusCode || 500;
	const message = err.message || "Internal Server Error";

	// Логируем ошибку на русском языке
	log(`❌ Ошибка ${status}: ${message}`);

	if (req.path.startsWith("/api")) {
		// API ошибки возвращаем как JSON
		res.status(status).json({
			message,
			timestamp: new Date().toISOString(),
			path: req.path,
		});
	} else {
		// Для фронтенда - HTML страницы ошибок
		if (status === 404) {
			res.status(404).send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <title>404 - Страница не найдена</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(45deg, #FF6B35, #F1C40F); }
            .error-container { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); max-width: 500px; margin: 0 auto; }
            h1 { color: #E74C3C; font-size: 3em; margin: 0; }
            p { color: #2C3E50; font-size: 1.2em; }
            .burger { font-size: 4em; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <div class="burger">🍔</div>
            <h1>404</h1>
            <p>Эта страница съедена космическим единорогом!</p>
            <a href="/" style="color: #FF6B35; text-decoration: none; font-weight: bold;">🏠 Вернуться домой</a>
          </div>
        </body>
        </html>
      `);
		} else {
			res.status(status).send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
          <meta charset="UTF-8">
          <title>Ошибка сервера</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(45deg, #E74C3C, #8E44AD); }
            .error-container { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); max-width: 500px; margin: 0 auto; }
            h1 { color: #E74C3C; font-size: 3em; margin: 0; }
            p { color: #2C3E50; font-size: 1.2em; }
            .burger { font-size: 4em; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <div class="burger">💥</div>
            <h1>Ошибка ${status}</h1>
            <p>Что-то пошло не так с нашими магическими бургерами...</p>
            <p style="font-size: 0.9em; color: #7F8C8D;">${message}</p>
            <a href="/" style="color: #E74C3C; text-decoration: none; font-weight: bold;">🏠 Вернуться домой</a>
          </div>
        </body>
        </html>
      `);
		}
	}

	if (status >= 500) {
		throw err;
	}
});

(async () => {
	const server = await registerRoutes(app);

	// Настройка Vite для разработки или статических файлов для продакшена
	if (process.env.NODE_ENV === "development") {
		await setupVite(app, server);
	} else {
		serveStatic(app);
	}

	// Определяем порт из переменных окружения или аргументов командной строки
	let port = parseInt(process.env.PORT || "5000", 10);

	// Парсим аргумент --port если он есть
	const portArgIndex = process.argv.indexOf("--port");
	if (portArgIndex !== -1 && portArgIndex + 1 < process.argv.length) {
		const customPort = parseInt(process.argv[portArgIndex + 1], 10);
		if (!isNaN(customPort)) {
			port = customPort;
		}
	}

	server.listen(
		{
			port,
			host: "0.0.0.0",
		},
		() => {
			log(`🍔 Burger Builder сервер запущен на порту ${port}`);
			log(`🌍 Доступен по адресу: http://localhost:${port}`);

			// Логируем переменные окружения для дебага
			if (process.env.DATABASE_URL) {
				log(`📄 База данных подключена`);
			} else {
				log(`⚠️  Внимание: DATABASE_URL не установлен`);
			}
		},
	);
})();
