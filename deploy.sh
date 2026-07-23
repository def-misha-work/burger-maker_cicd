#!/bin/bash
set -xe

# Механика для ролбека получаем предпоследнюю версию из Nexus
if [ "$VERSION" == "previous" ]; then
    VERSIONS=$(curl -s -u "${NEXUS_LOGIN}:${NEXUS_PASS}" \
        "${NEXUS_URL}/service/rest/v1/search?repository=${NEXUS_REPO}&group=&name=burger-market" \
        | jq -r '.items[].version' | sort -V | uniq)
    PREVIOUS_VERSION=$(echo "$VERSIONS" | tail -n 2 | head -n 1)
    
    if [ -z "$PREVIOUS_VERSION" ]; then
        echo "Не удалось найти предпоследнюю версию"
        exit 1
    fi
    VERSION="$PREVIOUS_VERSION"
    echo "Используем версию: $VERSION"
fi


# Создаём директорию ДО загрузки архива
sudo mkdir -p /ubuntu/burger-market

# Копируем unit-файл
sudo cp /ubuntu/burger-market/burger-market.service /etc/systemd/system/

# Скачиваем архив
cd /ubuntu/burger-market/
wget --user="${NEXUS_LOGIN}" --password="${NEXUS_PASS}" -O /ubuntu/burger-market/burger-market.tar.gz "${NEXUS_URL}/${NEXUS_REPO}/burger-market_${VERSION}.tar.gz"

# Распаковываем
sudo tar -xzf burger-market.tar.gz -C /ubuntu/burger-market

# Устанавливаем зависимости
cd /ubuntu/burger-market/
npm install

# Делаем .env для работы приложения. Без этого падает с ошибкой DATABASE_URL!
cat >/ubuntu/burger-market/.env <<EOF
DATABASE_URL=${DATABASE_URL}
NODE_ENV=${NODE_ENV}
ENABLE_SOCIAL_SHARING=${ENABLE_SOCIAL_SHARING}
ENABLE_RATING_SYSTEM=${ENABLE_RATING_SYSTEM}
PORT=5000
EOF

# Миграции БД
cd /ubuntu/burger-market/
export DATABASE_URL
/usr/bin/npm run db:push

# Перезапускаем сервис
sudo systemctl daemon-reload
sudo systemctl enable burger-market
sudo systemctl restart burger-market

echo "=== deploy.sh завершился ==="
