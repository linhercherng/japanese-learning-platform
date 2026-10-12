"""Self-authored instructional text only. edge-tts 7.2.8, TLS verification enabled.

Run with edge-tts installed in the chosen Python environment. Synthesis contacts
Microsoft; the application itself plays these saved MP3s without network access.
"""
import asyncio
import hashlib
import json
from pathlib import Path
import ssl
import aiohttp
import edge_tts
import edge_tts.communicate

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "app" / "assets"
VOICE = "ja-JP-NanamiNeural"

async def main():
    texts = json.loads((ASSETS / "audio-texts.json").read_text(encoding="utf-8"))
    audio_dir = ASSETS / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)
    mapping = {}
    limit = asyncio.Semaphore(4)
    context = ssl.create_default_context()  # Includes Windows platform CA store.
    # edge-tts passes its module context to ws_connect. Use verified platform CAs.
    edge_tts.communicate._SSL_CTX = context
    completed = 0
    async def save(text):
        nonlocal completed
        name = hashlib.sha256((VOICE + "\n" + text).encode()).hexdigest()[:20] + ".mp3"
        output = audio_dir / name
        async with limit:
            if not output.exists() or output.stat().st_size < 512:
                for attempt in range(3):
                    try:
                        # edge-tts can recreate ClientSession after a server clock retry.
                        # Leave ownership to the library; verified context is set above.
                        await edge_tts.Communicate(text, VOICE, rate="-10%").save(str(output))
                        break
                    except Exception:
                        if attempt == 2:
                            raise
                        await asyncio.sleep(2 * (attempt + 1))
            if output.stat().st_size < 512:
                raise RuntimeError(f"Empty audio: {text}")
            mapping[text] = "assets/audio/" + name
            completed += 1
            if completed % 25 == 0:
                print(f"Audio {completed}/{len(texts)}", flush=True)
    await asyncio.gather(*(save(text) for text in texts))
    (ASSETS / "audio.json").write_text(json.dumps(mapping, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Saved {len(mapping)} locally playable synthesized audio files.", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
