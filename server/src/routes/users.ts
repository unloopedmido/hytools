import { Router } from 'express';

const App = Router();

App.get("/username/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`)
    const data = (await response.json()) as { name: string; id: string };

    res.json(data);
  } catch (error) {
    console.error(`Failed to fetch user:`, error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
})

App.get("/uuid/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;

    const response = await fetch(`https://api.minecraftservices.com/minecraft/profile/lookup/${uuid}`)
    const data = await response.json();

    res.json(data);
  }
  catch (error) {
    console.error(`Failed to fetch user:`, error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
})

export default App;
