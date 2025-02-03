# test_websocket.py
import asyncio
import websockets

async def test_websocket():
    url = 'wss://jooyoung.click/vite/'
    try:
        async with websockets.connect(url) as ws:
            print("WebSocket 연결 성공: 연결이 열렸습니다.")
    except Exception as e:
        print("WebSocket 연결 실패:", e)

asyncio.run(test_websocket())
