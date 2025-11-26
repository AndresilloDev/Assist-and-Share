import cloudinary from "../config/cloudinary.js"

export const uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se envió ningún archivo" })
    }

    // Convertir el buffer del archivo a Base64 para Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString("base64")
    const dataURI = `data:${req.file.mimetype};base64,${b64}`

    const uploadRes = await cloudinary.uploader.upload(dataURI, {
      folder: "events/materials"
    })

    return res.json({
      secure_url: uploadRes.secure_url,
      public_id: uploadRes.public_id
    })

  } catch (error) {
    console.error("Error subiendo archivo:", error)
    return res.status(500).json({ message: "Cloudinary error" })
  }
}