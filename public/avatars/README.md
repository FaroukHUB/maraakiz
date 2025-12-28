# Avatars Directory

## Required Avatar Images

This directory should contain the following 6 avatar images:

### Student Avatars
1. **homme.webp** - Avatar for adult male students
2. **femme.webp** - Avatar for adult female students
3. **garcon.webp** - Avatar for boy students
4. **fille.webp** - Avatar for girl students

### Professor Avatars
5. **prof-homme.webp** - Avatar for male professors
6. **prof-femme.webp** - Avatar for female professors

## Avatar Assignment

### Students
When a professor registers a student and selects their gender:
- **Homme** → `/avatars/homme.webp`
- **Femme** → `/avatars/femme.webp`
- **Garçon** → `/avatars/garcon.webp`
- **Fille** → `/avatars/fille.webp`

The avatar is automatically assigned via the backend API based on the `genre` field.

### Professors
Professors can:
1. Use default avatars (prof-homme.webp or prof-femme.webp)
2. Upload custom photos

⚠️ **Important**: If a professor uploads a custom photo, the system will display a red warning:
**"⚠️ Images de représentation d'âme interdite"**

## Implementation Status

✅ Backend models updated with `avatar_url` field
✅ Database migration completed
✅ Student registration form includes genre dropdown
✅ Auto-assignment logic implemented
✅ Student list displays avatars
✅ Student details page displays avatars
✅ Calendar displays avatars
⏳ **Waiting for avatar images to be uploaded**

## Next Steps

Once you provide the 6 avatar images, they should be placed in this directory with the exact filenames listed above.
