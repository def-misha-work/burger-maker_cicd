.PHONY: push

push:
	@if [ -z "$(MSG)" ]; then \
		echo "Ошибка: укажите сообщение коммита: make push MSG=\"текст\""; \
		exit 1; \
	fi
	git add .
	git commit -m "$(MSG)"
	git push
