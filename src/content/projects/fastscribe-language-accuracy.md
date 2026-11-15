---
title: "Whisper accuracy across twelve languages"
group: fastscribe
kinds: [ai, data]
order: 320
summary: "Error rates for 12 languages on production settings, and a silent speech-loss bug that short-clip benchmarks could never see."
facts:
  - { label: "Languages", value: "12" }
  - { label: "Test set", value: "FLEURS, 200 clips per language" }
  - { label: "Best and worst", value: "Spanish 3.7%, Hindi 48.5% WER" }
  - { label: "Long-file fix", value: "recovered all 3 drops in the canary" }
diagram:
  type: bars
  caption: "Error rate by language on FLEURS with production flags. Word error rate, except character error rate for Japanese and Chinese. Lower is better."
  unit: "% error"
  bars:
    - { label: "Spanish (WER)", value: 3.7 }
    - { label: "Italian (WER)", value: 5.2 }
    - { label: "Portuguese (WER)", value: 5.8 }
    - { label: "German (WER)", value: 6.1 }
    - { label: "Japanese (CER)", value: 7.1 }
    - { label: "French (WER)", value: 7.4 }
    - { label: "English (WER)", value: 8.3 }
    - { label: "Russian (WER)", value: 8.6 }
    - { label: "Chinese (CER)", value: 10.3 }
    - { label: "Korean (WER)", value: 13.0 }
    - { label: "Arabic (WER)", value: 17.0 }
    - { label: "Hindi (WER)", value: 48.5 }
links:
  - { label: "thefastscribe.com", href: "https://thefastscribe.com" }
shots: [fastscribe-guide-language-accuracy.png]
---

## The problem

FastScribe accepts 12 language hints. Published Whisper accuracy comes from OpenAI's setup, not mine, and my build, quantization, VAD and flags all differ. I needed error rates for the service as it runs, for every language it offers.

## What I built

A benchmark on the FLEURS test split: 200 clips per language, run with production flags and scored with the Whisper paper's normalizer method. Word error ran from 3.7% for Spanish to 48.5% for Hindi, with English, the control, at 8.3%. Japanese and Chinese, scored by character, came in at 7.1% and 10.3%. I published the full table as a guide, the poor Hindi result included.

## How it works

Language detection was right every time for every language except Hindi, at 77.8%: 40 Hindi clips were detected as Urdu. On the 154 clips detected as Hindi, word error fell to 32.5%. OpenAI reports 17 for Hindi, and the guide says plainly that detection explains only part of the gap.

An adversarial review of the method caught a trap before I published. The default BasicTextNormalizer strips Unicode marks, which shreds Devanagari and flattered Hindi by 11 points. I fixed the scoring.

## What went wrong

Every clip in that test is under about 20 seconds, and so was every other eval I ran. That hid a bug in long files: whisper.cpp dropped stretches of speech with exit code 0, no warning and the same result each run. I proved it by transcribing the missing windows alone, which gave back coherent text. The cause was drift at window transitions in the whisper.cpp build I ran, reproduced on three models and not caused by VAD.

On 8 continuous LibriVox files in 7 languages, 7 lost nothing. A 29-minute Hindi file lost 2.375% of its speech in three drops, the longest 15.92 seconds. The fix splits long audio at silences into pieces under 30 seconds and stitches the transcripts with offset timestamps. It costs 2.32% WER and halves the segment count on clean audio, so I gate it per language and only Hindi uses it. A canary run of that Hindi file through the live path, 64 chunks in 915 seconds, recovered all three known drops. Across every known drop it recovers 4 of 5, and files sent without a language hint still take the old path. Silero VAD misses 0.17% of speech; I log those gaps rather than fill them, because invented text is worse than a gap.

## What it proved

A benchmark sees only what its inputs contain. Short clips measured accuracy well and speech loss not at all.
