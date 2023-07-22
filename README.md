# Panthalia 🌎👁️‍🗨️ 🎨 🖋️

> Panthalia (/panˈTHālēə/) combines the Greek roots pan- ("all"), thalia ("Muse of comedy and idyllic poetry"). The intended meaning is "flourishing or creating everywhere." 

## Overview
The goal of this project is to enable quickly authoring and iterating on blog posts on the go from my phone. This results in pull requests on GitHub, which generate Vercel deployment previews to review on mobile. When back at a computer, posts can be polished up and published on a live blog.

The project will also explore and leverage AI services for automatic image generation based on prompts.

Together this enables a streamlined mobile-first blogging workflow resulting in high quality published posts, while allowing me to quickly stub out and start posts whenever and wherever they occur to me.

```mermaid
graph LR;
    A[User Accesses Panthalia App] --> B[Create New Post];
    B --> D{Post Created in Vercel Postgres};
    B --> C[Branch Created in Portfolio Site];
    C --> E[Pull Request Opened];
    D --> F[Edit Post Content];
    F --> G{Happy with Post?};
    G --> |No| F;
    G --> |Yes| H[Finalize and Merge Pull Request];
    F --> I[Prompt for Image Generation];
    I --> J[Generate Image via DALL-E or Stable Diffusion];
    J --> F;
```

## Project goals / future features

* ✅ Expose a responsive web / mobile app 
* ✅ Create new blog posts by providing a title, summary, content and some optional image prompts
* ✅ Save draft (in-progress) posts to PostgreSQL
* ✅ Provide a form for editing in-progress posts on a mobile phone 
* Use either DALL-E or a Stable Diffusion microservice for image generation, using the posts's image prompts
* The edit form should allow re-generating or deletion of images
* The edit form should allow drag and drop of generated images between paragraphs of text
* Use OpenAI's GPT-4 model to compose the blog post to ensure it's inline with the style of my existing blog posts
* ✅ A pull request to my personal portfolio site, whose source lives at github.com/zackproser/portfolio, is opened programmatically 
* The Vercel preview URL that is generated by the pull request is saved to the database and shown on the mobile app with the posts 

## Stack 
* Next.js
* Vercel

## Installation

Clone the repo

`git clone https://github.com/zackproser/panthalia.git`

Install NPM packages

`npm install`

### Configure environment variables

Copy the .env.example file to .env and supply your PostgreSQL credentials and other API keys.

### Start the dev server

`npm run dev`

Open http://localhost:3000 to view the app.

