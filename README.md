

Intended user flow;

- User enters “orionos.net”
- User inputs “OrionX” as the one-time password
- User signs up with Clerk via custom sign in pages
- User is presented with a pure black screen
- User hovers along the bottom of the screen their cursor to reveal the hidden dock
- User opens the “Stellar” app and uploads a video and 8 dock icons
- User opens the Flow app to reveal the “All Streams” dashboard
- User navigates to; “Apps” -> “Orion” -> “Core” stream -> “Zenith" config flow
- User duplicates the default Zenith config flow and renames to “Daimon”
- User opens the new Flow to reveal the respective Flow Editor
- User selects each respective node, changes its mode to media and connects the appropriate media
- User exits the Editor via “ESC” and closes the Flow app
- User hovers their cursor along the top of the screen to reveal the menu bar
- User clicks the “Flow” icon to reveal the dropdown and selects their new Orion config flow
- User sees the desktop Wallpaper and Dock icons update in real time.


FullStack Discord App Clone Architecture - Our core reference

Project Setup

- ‘*npx create-next-app@latest ./*’
	- TypeScript: Yes
	- Tailwind: Yes
	- ‘app/’: Yes
	- App Router: Yes
- ‘*npx shadcn@latest init*’



Authentication

- ‘npm i @clerk/nextjs’
- Create Clerk app
- Paste .env keys + middleware.ts
- Create custom sign-in/sign-up page and wrap root layout



Dark & Light Theme setup

- ‘npm i next-themes’
- Paste ‘components/theme-provider.tsx’ from ShadCN Docs + wrap root layout
- Paste ‘components/mode-toggle.tsx’ and install ShadCN dropdown-menu component



Prisma & Database setup

- ‘npm i -D prisma’, ‘npm i @prisma/client’, ‘npx prisma init’
- Create NeonDB database, paste .env key
- *Create schema modals*;
	- Profile
	- *Server*
	- Member
	- *Channel*
- ‘npx prisma generate’, ‘npx prisma db push’
- Create ‘/root/lib/*db*.ts’ util file.
- Create ‘/root/lib/*initial-profile*.ts’ to check if the user exists and if not redirect to the sign-in page, and then check if their profile exists, creating one for them if not and returning the profile if one exists.
- Create ‘/root/app/*(setup)/page.tsx*’, import db.ts and initial-profile.ts, create a profile const to await initialProfile(); and then a *server const to await db.server.findFirst where members some profileId: profile.id, returning the user to the serverId page if it exists and displaying an initial server modal if none exist*



Initial server modal UI

  - ‘npx shadcn@latest add; *dialog, input, form*’
  - Create ‘/root/components/modals/*initial-modal*.tsx’, importing *zod, zodResolver, useForm, dialog, input and form and setting up the ReactForm using useForm, zodResolver and formSchema with default values of name and imageUrl and setting up the UI to have a header, instruction message, image upload button with the text “TODO: Image Upload”, form field with a server name input box where onSubmit logs the values in the browser console*



*UploadThing setup*

 - Create Uploadthing app, paste .env keys
 - ‘npm i uploadthing @uploadthing/react react-dropzone’
 - Paste ‘/api/uploadthing/core.ts’ and ‘/api/uploadthing/route.ts’, ‘/lib/uploadthing.ts’ from Uploadthing Docs
 - Add ‘/api/uploadthing' to middleware public routes
 - Replace “TODO: Image Upload” with form field, create ‘/root/components/file-upload.tsx' that can accept either “messageFile” or “serverImage” as its endpoints
 - Add “uploadthing.com” to next config image domains
 - Fill in fields and press create to successfully return this in the browser console; “{name: 'Code With Antonio', imageUrl:"https://uploadthing.com/f/69ab969b-1f0d-4e35-ac3d-48733dd0beb®97e88e49f7b5106952366c19166a259e.webp'} imageUrl: "https://uploadthing.com/f/69ab969b-name: "Code With Antonio"



*Server creation API*

 - ‘npm i axios’
 - import axios into initial-modal and replace the console log function with a try and catch block, resolving the error in the catch and *awaiting axios.post(“/api/servers”, values), resetting the form, refreshing the router and reloading the window.location*
 - Create a ‘/root/lib/*current-profile*’ util file to check the current profile of the user
 - Create ‘/root/app/api/servers/route.ts’, installing ‘npm i uuid’ and importing v4 as uuidv4, current profile, db and NextResponse that creates the users server with their profileId, name, imageUrl, inviteCode and general channel and member of profileId and MemberRole of ADMIN
 - Fill out fields and press create to be redirected to an error 404 page as ‘/root/app/(main)/(routes)/servers/[serverId]/page.tsx doesn’t exist yet