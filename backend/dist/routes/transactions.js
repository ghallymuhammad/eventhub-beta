"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const transactionController_1 = require("../controllers/transactionController");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.post('/', transactionController_1.createTransaction);
router.get('/', transactionController_1.getTransactions);
router.get('/:id', transactionController_1.getTransaction);
router.patch('/:id', transactionController_1.updateTransactionStatus);
router.post('/:id/payment-proof', upload_1.upload.single('paymentProof'), transactionController_1.uploadPaymentProof);
exports.default = router;
//# sourceMappingURL=transactions.js.map