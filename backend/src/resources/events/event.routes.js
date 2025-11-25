import e from "express";
import { EventController } from "./event.controller.js";
const router = e.Router();

router.get('/', EventController.getAllEvents);
router.get('/:id', EventController.getEventById);
router.post('/', EventController.createEvent);
router.post('/:id/start', EventController.startEvent);
router.post('/:id/complete', EventController.completeEvent);
router.put('/:id', EventController.updateEvent);
router.delete('/:id', EventController.deleteEvent);

export default router;