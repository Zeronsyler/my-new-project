const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB bağlantı dizgesini buraya yapıştırın
mongoose.connect('mongodb+srv://mfkarahan7:furkan27@cluster0.evggfux.mongodb.net/veritaban?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const appointmentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phone: String,
  date: String,
  time: String
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

app.post('/appointments', async (req, res) => {
  const { firstName, lastName, phone, date, time } = req.body;

  const existingAppointment = await Appointment.findOne({ date, time });
  if (existingAppointment) {
    return res.status(400).send('Bu tarih ve saatte zaten bir randevu var.');
  }

  const appointment = new Appointment({ firstName, lastName, phone, date, time });
  await appointment.save();
  res.status(201).send('Randevu başarıyla alındı.');
});

app.get('/admin/appointments', async (req, res) => {
  const appointments = await Appointment.find();
  res.send(appointments);
});

app.put('/admin/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, date, time } = req.body;

  try {
    const appointment = await Appointment.findByIdAndUpdate(id, { firstName, lastName, phone, date, time }, { new: true });
    if (!appointment) {
      return res.status(404).send('Randevu bulunamadı.');
    }
    res.send('Randevu başarıyla güncellendi.');
  } catch (error) {
    console.error('Update Error:', error.message);
    res.status(500).send(`Randevu güncellenirken bir hata oluştu: ${error.message}`);
  }
});

app.delete('/admin/appointments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) {
      return res.status(404).send('Randevu bulunamadı.');
    }
    res.send('Randevu başarıyla silindi.');
  } catch (error) {
    console.error('Delete Error:', error.message);
    res.status(500).send(`Randevu silinirken bir hata oluştu: ${error.message}`);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
