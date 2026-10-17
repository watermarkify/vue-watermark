# Playground

From the repository root, run:

```sh
pnpm play
```

Open the local URL printed by Vite (normally `http://localhost:5173/vue-watermark/`).

- **Text watermark** resets the preview to repeated text.
- **Multiline text** demonstrates left-aligned lines with custom line height. Edit the content field with one line per row.
- **Opacity** fades text or image watermarks without fading the slot; **Disable watermark** pauses rendering and image loading.
- **Line height (px)** sets the distance between text lines. Clear it for automatic spacing. **Text alignment** aligns lines inside the text width. Both controls are inactive for image watermarks.
- **Repeating logo** uses the bundled transparent logo with rotation and repeated tiles.
- **Corner logo** places a single logo in the bottom-right corner.
- Enter an **Image URL** and choose **Apply image**, or choose a local image file. Local files are previewed in the browser without uploading them.
- Change **Image CORS mode** for remote images. The server must send compatible CORS headers; failures are shown below the image controls.
- Leave width and height blank for intrinsic image dimensions. Set one dimension to scale proportionally, or both to fit inside a bounding box.
- Expand **Vue example code** to copy the current configuration. Replace `./logo.svg` or `./your-logo.png` with your own asset path.

Build the playground without publishing it:

```sh
pnpm play:build
```
