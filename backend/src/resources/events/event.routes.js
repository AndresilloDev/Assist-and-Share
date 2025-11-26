import express from "express"
const router = express.Router()

import upload from "../../middlewares/upload.js"
import { EventController } from "./event.controller.js"


router.get("/", EventController.getAllEvents)
router.get("/:id", EventController.getEventById)
router.post("/", EventController.createEvent)
router.put("/:id", EventController.updateEvent)
router.delete("/:id", EventController.deleteEvent)


router.post(
  "/:id/material",
  upload.single("file"), 
  EventController.uploadMaterialToEvent
)

export default router
