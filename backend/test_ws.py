import asyncio
import websockets

async def test():
    async with websockets.connect("ws://localhost:8000/api/stream/R3CW70WN6AM") as ws:
        msg = await ws.recv()
        print("Received:", len(msg), "bytes")

asyncio.run(test())
