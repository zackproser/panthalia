CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  slug TEXT,
  summary TEXT,
  content TEXT,
  status TEXT,
  githubpr TEXT,
  gitbranch TEXT,
  createdat TIMESTAMP,
  updatedat TIMESTAMP,
  error TEXT
);

CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id),
  image_url TEXT,
  prompt_text TEXT,
  error TEXT
);
