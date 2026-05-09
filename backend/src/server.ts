import app from './app';
import express from 'express';
import pushRoutes from './modules/notifications/notification.routes';

app.use('/api/notifications', pushRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

