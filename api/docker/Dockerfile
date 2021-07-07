FROM buildkite/puppeteer:10.0.0

WORKDIR '/app'
COPY ./package.json ./
RUN npm i
COPY . .
CMD ["npm", "run", "start"]