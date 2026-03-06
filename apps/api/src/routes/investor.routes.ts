import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  listInvestors,
  getInvestor,
  createInvestor,
  updateInvestor,
  deleteInvestor,
} from "../controllers/investor.controller";

const router = Router();

router.use(authenticate);
router.get("/", listInvestors);
router.get("/:id", getInvestor);
router.post("/", createInvestor);
router.put("/:id", updateInvestor);
router.delete("/:id", deleteInvestor);

export default router;
