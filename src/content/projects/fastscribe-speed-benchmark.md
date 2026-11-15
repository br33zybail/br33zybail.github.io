---
title: "Whisper speed on GPU and CPU"
group: fastscribe
kinds: [ai, data]
order: 310
summary: "A recorded benchmark of whisper.cpp on an RTX 3090 Ti and 32 EPYC cores, and the earlier speed figure it made me retire."
facts:
  - { label: "GPU speed", value: "40x realtime, large-v3-turbo" }
  - { label: "One hour of audio", value: "about 90 seconds on the GPU" }
  - { label: "Corpus", value: "604.47 s of LibriSpeech, 81 files" }
  - { label: "Method", value: "median of 3 runs per setting" }
diagram:
  type: bars
  caption: "Speed as a multiple of realtime, median of 3 runs on 604 s of LibriSpeech. Higher is faster."
  unit: "x realtime"
  bars:
    - { label: "GPU, turbo q8_0", value: 40 }
    - { label: "GPU, turbo q5_0", value: 38 }
    - { label: "GPU, base.en", value: 49 }
    - { label: "CPU 32 cores, turbo", value: 5.1 }
    - { label: "CPU 32 cores, small.en", value: 8.2 }
    - { label: "CPU 32 cores, base.en", value: 15 }
links:
  - { label: "Published benchmark guide", href: "https://thefastscribe.com/guides/whisper-speed-benchmarks" }
  - { label: "thefastscribe.com", href: "https://thefastscribe.com" }
shots: [fastscribe-guide-whisper-speed-benchmarks.png]
---

## The problem

A transcription service sells on speed, and speed numbers are easy to get wrong. A busy server, a different clip or a lucky run can double or halve a result. I needed one figure I could defend line by line, and I needed to know what had made the service slow.

## What I built

A benchmark with a written method, published as a guide on the site. The corpus is the first 81 files of LibriSpeech dev-clean in speaker-ID order: 604.47 seconds of 16 kHz mono audio under CC BY 4.0, with the file list published. Each setting runs three times and I report the median.

On the RTX 3090 Ti, large-v3-turbo at q8_0 runs at 40x realtime, about 90 seconds per hour of audio. f16 also gives 40x, q5_0 38x, small.en 40x and base.en 49x. On 32 cores of the EPYC 7702P, turbo runs at 5.1x, small.en at 8.2x and base.en at 15x.

## How it works

Every setting sees the same files, and the result is audio length divided by wall time. On the GPU the model barely matters: the pipeline sets the pace, and quantization saves memory rather than time. On the CPU, model size matters a great deal. I had moved transcription from CPU to the GPU on 26 July 2026.

I threw away two rounds of CPU numbers because another process woke mid-run and halved the speed. The final runs landed within 0.6% of each other.

## What went wrong

An earlier figure of mine did not survive a recorded benchmark, so I retired it. It came from an ad hoc test with several jobs running at once, and when I repeated the test under the written method it would not reproduce. The site and the guide now quote 40x for the production model.

The first slow-transcription report, on launch day, had a different cause. A 20-second clip took about 100 seconds. A crypto miner on the same server held about 126 of its 128 threads, and whisper depends on memory bandwidth, so the miner starved it. With the miner stopped, the same clip took 8.7 seconds. I then marked every number taken before that day as tainted by contention.

## What it proved

A published speed figure needs a method someone else could rerun: a named corpus, a run count and a median. Anything less is an anecdote, my own included. On a shared machine, the first suspect for a slow job is the other work on the box, not the code.
