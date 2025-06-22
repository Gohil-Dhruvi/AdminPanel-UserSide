const express = require('express');
const router = express.Router();
const { AddAdminPage, AddNewAdmin, ViewAdminsPage, EditAdminPage, DeleteAdminPage, UpdateAdmin } = require('../controller/admin.controller');
const Admin = require('../model/admin.model');

router.get('/add-admin', AddAdminPage);
router.post('/add-admin', Admin.uploadImage, AddNewAdmin); 
router.get('/views-admin',ViewAdminsPage);
router.get('/edit-admin/:id',EditAdminPage);
router.post("/update-admin/:id", Admin.uploadImage, UpdateAdmin);
router.get('/delete-admin/:id',DeleteAdminPage);

module.exports = router;    
