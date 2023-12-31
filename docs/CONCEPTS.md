# Architecture, philosophy and core concepts
Panthalia is built to be extremely responsive and to handle all long-running tasks asynchronously. When I submit the new post form, the new post is accepted and the API route immediately returns - allowing me to either continue editing other posts 
or to fire off another several. 

Panthalia is deployed to Vercel and leveraging Vercel's Postgres offering, but all asynchronous work is done in a "fire and forget" fashion - my API routes accept work like new posts or post edits, but kick off other API route calls to handle the long-running work such as: 

* Cloning my portfolio repository which contains my app 
* Calling out to my StableDiffusion endpoint, which is served by Replicate
* Saving the image files generated by Replicate to AWS S3 (which is necessary because Replicate's URLs that host generated images are only valid for 1 hour - to save on their own storage costs)
* Re-generating images at my request - which is so far a normal part of using StableDiffusion as your image generator when building content for the web (in my experience)
* Saving durable image URLs returned from S3 to Postgres
* Committing the generated images I do like to my portfolio site on the same branch as the original pull request so that I can reference them from my markdown updates

Together this enables a streamlined mobile-first blogging workflow resulting in high quality published posts, while allowing me to quickly stub out and start posts whenever and wherever they occur to me.

I'm certainly a [Vercel convert / fanboy](https://www.zackproser.com/blog/maintaining-this-site-no-longer-fucking-sucks) but running this project in particular on Vercel introduced some interesting challenges: for example, using git for this app was core to the architecture and workflows, but you cannot install arbitrary packages on Vercel functions, such as git. I was able to leverage the excellent isomorphic-git package 
which re-implements core git functionality in pure JavaScript that works both on the client and server. 

## Why isn't Panthalia parameterized so other folks can use it? 

Currently, Panthalia is very much tightly coupled to the architecture of my blog and the manner in which I compose blog posts. While it leverages some "AI" services, the main purpose of the project *is not* to have AI take 
over authoring blog posts for me or in my style. 

Many things are currently hardcoded / assumeed just for me such as: 

* My GitHub username & credentials
* My own GitHub oAuth app - allowing me and only me to log in from anywhere
* My personal portfolio's repository
* The structure of my portfolio's site and blog posts
* My preferred stack of Vercel, Next.js and Tailwind CSS / UI

If there's sufficient interest in the future, I might spend some time parameter-izing these things so that others could deploy a version of this app more easily for themselves. In the meantime, I've open sourced it because: 
* I wanted to practice with Next.js / Vercel and document certain patterns for myself in the future
* In case somebody wants to fork this and modify or deploy it for their own use 

