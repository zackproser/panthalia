### Basics

* ✅ Expose a responsive web / mobile app 
* ✅ Create new blog posts by providing a title, summary, content and some optional image prompts
* ✅ Save draft (in-progress) posts to PostgreSQL
* ✅ Provide a form for editing in-progress posts on a mobile phone 
* ✅ After creating a new post and pull request, the pull request URL and the branch should be saved to the post's record

### AI integration 

* ✅ Use a Stable Diffusion microservice (running on Replicate) for "leader image" generation, using the posts's image prompts
* ✅ Generated images are saved to S3 for temporary storage so they can be pulled back and reviewed while editing a post
* ✅ Generated leader images stored in S3 are saved to the images table with an associated post ID so that they can be retrieved during post editing
* ✅ Edit form supports generating multiple images simultaneously
* Consider training OpenAI's GPT-4 model to review the draft post to ensure it's inline with the style of my existing blog posts, which would assist in Iterating while on the go. Currently, the most interesting idea I have here is around creating a GitHub action that can 
read my editorial comments on an open pull request and make the requested edits directly on the same branch. This could be a nice way to handle slight more complex tasks than might be comfortable to pull off in a markdown editor, such as: "Please figure out why this branch isn't 
building successfully, resolve the imports as needed and run the tests to ensure you've fixed the issue".
* Consider additional markdown WYSIWYG editor custom buttons that may leverage AI:
    * Re-word this section for clarity (etc)

### Iterating on a post

* ✅ The edit form should be aware of an existing branch and push any changes up on that same branch as additional commits
* The edit form should allow re-generating or deletion of images
* ✅ The edit form should allow for images the user is happy with to be committed and pushed on the same branch as the open pull request, so that they can be referenced in the blog post body via Next.js `<Image>`elements.

### Automation 

* ✅ A pull request to my personal portfolio site, whose source lives at github.com/zackproser/portfolio, is opened programmatically 
* ✅ Pull requests that are opened are saved to the database and associated with the post they contain 

