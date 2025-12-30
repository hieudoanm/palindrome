import json
import requests
import logging

# -------------------------------------------------------------------
# Logging configuration
# -------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,  # Change to DEBUG for verbose output
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        # logging.FileHandler("app.log", mode="w"),
    ],
)

# -------------------------------------------------------------------
# API configuration
# -------------------------------------------------------------------
encrypted = "8cfdb18fe722929be89607beed58bab8aeb32b0939ff96b8"
when = "2025-01-27T12:41:36.901Z"
limit = 1_000_000

url = f"https://www.wordsapi.com/mashape/words?when={when}&encrypted={encrypted}&limit={limit}"

logging.info(f"Sending request to URL: {url}")

# -------------------------------------------------------------------
# Fetch data
# -------------------------------------------------------------------
response = requests.get(url)

if response.status_code == 200:
    logging.info(f"Request successful (status code {response.status_code})")
else:
    logging.error(f"Request failed with status code {response.status_code}")
    response.raise_for_status()

# -------------------------------------------------------------------
# Parse response
# -------------------------------------------------------------------
try:
    data = response.json()
except json.JSONDecodeError:
    logging.error("Failed to decode JSON response")
    raise

results = data.get("results", {})
total = results.get("total", 0)
logging.info(f"Total words reported by API: {total}")

words = results.get("data", [])
logging.info(f"Retrieved {len(words)} words")


# -------------------------------------------------------------------
# Filtering helpers
# -------------------------------------------------------------------
def is_valid_word(word: str) -> bool:
    """Word length > 1 and contains only letters (no digits/symbols)."""
    return len(word) > 1 and word.isalpha()


def is_palindrome(word: str) -> bool:
    """Check if a word is a palindrome."""
    return word == word[::-1]


def is_emordnilap(word: str, word_list: set) -> bool:
    """Check if a word is an emordnilap (a valid word that forms another word when reversed)."""
    reversed_word = word[::-1]
    return reversed_word in word_list and reversed_word != word


# -------------------------------------------------------------------
# Filtering logic
# -------------------------------------------------------------------
# Using a set for faster lookups
word_set = set(words)

filtered_words = [word for word in words if is_valid_word(word)]
logging.info(f"Filtered to {len(filtered_words)} valid words (len > 1, letters only)")

palindrome_words = [word for word in filtered_words if is_palindrome(word)]
logging.info(f"Found {len(palindrome_words)} palindrome words")

# Find Emordnilap words
emordnilap_words = [word for word in filtered_words if is_emordnilap(word, word_set)]
logging.info(f"Found {len(emordnilap_words)} emordnilap words")

logging.debug(f"Palindrome words: {palindrome_words}")
logging.debug(f"Emordnilap words: {emordnilap_words}")

# -------------------------------------------------------------------
# Save to separate JSON files
# -------------------------------------------------------------------
palindrome_file_path = "db/palindrome_words.json"
emordnilap_file_path = "db/emordnilap_words.json"

try:
    # Save Palindromes
    with open(palindrome_file_path, "w", encoding="utf-8") as json_file:
        json.dump(palindrome_words, json_file, indent=4, ensure_ascii=False)
    logging.info(f"Palindrome words saved to {palindrome_file_path}")

    # Save Emordnilaps
    with open(emordnilap_file_path, "w", encoding="utf-8") as json_file:
        json.dump(emordnilap_words, json_file, indent=4, ensure_ascii=False)
    logging.info(f"Emordnilap words saved to {emordnilap_file_path}")

except Exception as e:
    logging.error(f"Failed to save words to files: {e}")
