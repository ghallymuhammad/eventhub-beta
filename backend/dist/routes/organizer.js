"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const organizerController_1 = require("../controllers/organizerController");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.use((0, auth_1.restrictTo)('ORGANIZER'));
router.get('/stats', organizerController_1.getOrganizerStats);
router.get('/events', organizerController_1.getOrganizerEvents);
router.get('/transactions', organizerController_1.getOrganizerTransactions);
exports.default = router;
//# sourceMappingURL=organizer.js.map