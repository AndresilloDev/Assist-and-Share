import express from "express";
const router = express.Router();

import { EventController } from "./event.controller.js";

router.get("/", EventController.getAllEvents);
router.get("/:id", EventController.getEventById);
router.post("/", EventController.createEvent);
router.put("/:id", EventController.updateEvent);
router.delete("/:id", EventController.deleteEvent);
router.post("/upload-temporary", EventController.uploadTemporary);

export default router;
