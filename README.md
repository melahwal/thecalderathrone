# The Caldera Throne Website

Premium static author and intellectual-property website for Mustafa M. El Ahwal and the adult political war fantasy series **The Caldera Throne**.

## Project Structure

```text
.
|-- index.html
|-- novels.html
|-- world.html
|-- characters.html
|-- adaptation.html
|-- author.html
|-- rights.html
|-- styles.css
|-- script.js
|-- README.md
`-- assets/
    |-- book-1-cover.png
    |-- book-2-cover.png
    |-- book-3-cover.png
    |-- world-map.svg
    |-- author-photo.svg
    `-- character-*.svg
```

## Replacing Images

Replace any placeholder SVG in `assets/` with your final image while keeping the same filename, or update the matching `src` path in the relevant page file.

Recommended production image sizes:

- Book covers: `1200 x 1800px`
- Character illustrations: `1200 x 1500px`
- World map: `2400 x 1400px`
- Author photo: `1200 x 1500px`

Use optimized `.jpg`, `.webp`, or `.png` files for final deployment.

## Editing Text

Each major section now has its own page:

- Home: `index.html`
- Novels: `novels.html`
- World: `world.html`
- Characters: `characters.html`
- TV Adaptation and Series Expansion: `adaptation.html`
- Author: `author.html`
- Contact / Rights Inquiry: `rights.html`

Edit the visible copy directly in the matching page.

## Styling

The visual system is controlled in `styles.css`. The main color and typography variables are at the top under `:root`.

## Local Preview

Open `index.html` directly in a browser. No build step is required.

## Deploying on Netlify

1. Create a new Netlify site.
2. Drag and drop the whole project folder into Netlify Drop, or connect the folder through a Git repository.
3. Leave the build command empty.
4. Set the publish directory to the project root.
5. Deploy.

For a custom domain, add it in Netlify under **Site configuration > Domain management**.
