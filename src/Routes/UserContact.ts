import express, { Router, Request, Response } from "express";
import { 
  AddUserContact, 
  addContact, 
  getContacts, 
  updateContact, 
  removeContact, 
  searchContacts, 
  getContactByWallet 
} from "../Functions/UserContacts";
import { mockPrisma as prisma } from "../db-mock";

export const UserContactRouter: Router = express.Router();

// Legacy endpoints for backward compatibility
UserContactRouter.post("/save", async (req: Request, res: Response): Promise<any> => {
  try {
    const { userAddress, contactAddress, name } = req.body;
    
    if (!userAddress || !contactAddress || !name) {
      return res.status(400).send({
        success: false,
        message: 'Missing required fields: userAddress, contactAddress, name'
      });
    }

    const result = await AddUserContact({
      userAddress,
      name,
      contactAddress
    });
    
    return res.send({
      success: result.success,
      message: result.success ? "Contact saved successfully" : "Failed to save contact",
      result: result
    });
  } catch (err: any) {
    console.log("error saving the contact of the user", err);
    res.status(500).send({
      success: false,
      message: 'Error saving the user contact',
      error: err?.message || err
    });
  }
});

UserContactRouter.get("/contacts", async (req: Request, res: Response): Promise<any> => {
  try {
    const { userAddress } = req.query;
    
    if (!userAddress) {
      return res.status(400).send({
        success: false,
        message: 'Missing userAddress parameter',
        result: []
      });
    }

    const result = await getContacts(userAddress.toString());
    
    return res.send({
      success: result.success,
      message: result.message,
      result: result.contacts || []
    });
  } catch (err: any) {
    console.log("Error fetching the contacts for the user", err);
    return res.send({
      success: false,
      message: "Error fetching contacts for the user",
      result: [],
      error: err?.message || err
    });
  }
});

// Enhanced contact management endpoints
UserContactRouter.post("/contacts", async (req: Request, res: Response): Promise<any> => {
  try {
    const { userWallet, contactWallet, contactName, contactType, tags, notes } = req.body;
    
    if (!userWallet || !contactWallet || !contactName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userWallet, contactWallet, contactName"
      });
    }

    const result = await addContact(
      userWallet, 
      contactWallet, 
      contactName, 
      contactType || "friend",
      tags || [],
      notes || ""
    );

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    console.error("❌ Error in POST /contacts endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.message || error
    });
  }
});

UserContactRouter.get("/contacts/:userWallet", async (req: Request, res: Response): Promise<any> => {
  try {
    const { userWallet } = req.params;
    
    if (!userWallet) {
      return res.status(400).json({
        success: false,
        message: "Missing userWallet parameter"
      });
    }

    const result = await getContacts(userWallet);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    console.error("❌ Error in GET /contacts endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.message || error
    });
  }
});

UserContactRouter.put("/contacts/:contactId", async (req: Request, res: Response): Promise<any> => {
  try {
    const { contactId } = req.params;
    const updates = req.body;
    
    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "Missing contactId parameter"
      });
    }

    const result = await updateContact(parseInt(contactId), updates);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    console.error("❌ Error in PUT /contacts endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.message || error
    });
  }
});

UserContactRouter.delete("/contacts/:contactId", async (req: Request, res: Response): Promise<any> => {
  try {
    const { contactId } = req.params;
    
    if (!contactId) {
      return res.status(400).json({
        success: false,
        message: "Missing contactId parameter"
      });
    }

    const result = await removeContact(parseInt(contactId));
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    console.error("❌ Error in DELETE /contacts endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.message || error
    });
  }
});

UserContactRouter.get("/contacts/:userWallet/search", async (req: Request, res: Response): Promise<any> => {
  try {
    const { userWallet } = req.params;
    const { q: searchTerm } = req.query;
    
    if (!userWallet || !searchTerm) {
      return res.status(400).json({
        success: false,
        message: "Missing userWallet parameter or search term"
      });
    }

    const result = await searchContacts(userWallet, searchTerm as string);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    console.error("❌ Error in search contacts endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.message || error
    });
  }
});

UserContactRouter.get("/contacts/:userWallet/find/:contactWallet", async (req: Request, res: Response): Promise<any> => {
  try {
    const { userWallet, contactWallet } = req.params;
    
    if (!userWallet || !contactWallet) {
      return res.status(400).json({
        success: false,
        message: "Missing userWallet or contactWallet parameter"
      });
    }

    const result = await getContactByWallet(userWallet, contactWallet);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error: any) {
    console.error("❌ Error in find contact endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error?.message || error
    });
  }
});