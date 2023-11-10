FROM scratch


ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    openai=true \
    nexturl='https://rephonic.com/_next/data/7DQgwY0H_1cTIBCef377E/podcasts/'

COPY . .

CMD ["node","server.js"]