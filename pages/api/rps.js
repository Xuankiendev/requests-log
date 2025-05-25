export default function handler(req, res) {
  const time = new Date().toLocaleTimeString();
  const rps = Math.floor(Math.random() * 100) + 100;
  res.status(200).json({ time, rps });
}
