<?php

// src/Controller/AppController.php
namespace App\Controller;

use OpenAI;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;


class AppController
{
    #[Route('/api/summary', name: 'api_summary', methods: ["POST"])]
    public function summarize(Request $request): JsonResponse
    {
        $requestData = json_decode($request->getContent(), true);
        $text = $requestData['text'];
        $language = $requestData['language'];

        if (!$text || !is_string($text)) {
            return new JsonResponse(['error' => 'Invalid text.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        if (!$language || !is_string($language)) {
            return new JsonResponse(['error' => 'Invalid language.'], JsonResponse::HTTP_BAD_REQUEST);
        }

        $inputChunks = $this->splitText($text);
        $result = $this->summarizeChunks($inputChunks, $language);

        return new JsonResponse(['summary' => $result]);
    }

    private function splitText($text): array
    {
        $max_chunk_size = 512;
        $chunks = [];
        $current_chunk = "";

        $sentences = explode(".", $text);
        foreach ($sentences as $sentence) {
            if (strlen($current_chunk) + strlen($sentence) < $max_chunk_size) {
                $current_chunk .= $sentence . ".";
            } else {
                $chunks[] = trim($current_chunk);
                $current_chunk = $sentence . ".";
            }
        }

        if ($current_chunk) {
            $chunks[] = trim($current_chunk);
        }

        return $chunks;
    }

    private function summarizeChunks(array $chunks, string $language): string
    {
        $openAiKey = getenv('OPENAI_API_KEY');

        $openAi = OpenAI::client($openAiKey);

        $messages = [];

        $messages[] = [
            'role' => 'system',
            'content' => "You are a translator. You receive texts in any language and you have to summarize them and translate them in " . $language . "."
        ];

        $messages[] = [
            'role' => 'system',
            'content' => "You have to receive all of the messages first, then combine them, then summarize them and then translate them in " . $language . "."
        ];

        $messages[] = [
            'role' => 'system',
            'content' => "You have to return ONLY the translated summarized text, with no text from the original language."
        ];

        foreach ($chunks as $chunk) {
            $messages[] = ['role' => 'user', 'content' => $chunk];
        }

        $result = $openAi->chat()->create([
            "model" => "gpt-3.5-turbo-16k",
            'messages' => $messages,
            "temperature" => 0.5
        ]);

        return $result["choices"][0]["message"]["content"];
    }

}

