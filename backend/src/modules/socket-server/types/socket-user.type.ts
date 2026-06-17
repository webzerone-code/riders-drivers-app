export type SocketUser = {
  id: string;
  email: string;
  phone: string;
  userType: 'rider' | 'driver';
  socketId: string;
};
