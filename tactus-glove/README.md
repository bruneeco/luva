npm create vite@latest piano-glove-website --template react
cd piano-glove-website
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
json-server --watch db.json --port 3001
node fake-esp-server.js