import flet as ft
import random
import threading
import time
from enum import Enum
from typing import List, Tuple

class Difficulty(Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class GameState(Enum):
    SHOWING_ORIGINAL = "showing_original"
    SHOWING_SCRAMBLED = "showing_scrambled"
    WAITING_FOR_ANSWER = "waiting_for_answer"
    SHOWING_RESULT = "showing_result"
    GAME_OVER = "game_over"
    VICTORY = "victory"

class FlipFlopGame:
    def __init__(self):
        self.easy_words = [
            "CAT", "DOG", "RUN", "JUMP", "PLAY",
            "RED", "BLUE", "FISH", "BIRD", "TREE",
            "BOOK", "BALL", "HOME", "CAKE", "MILK",
            "SUN", "MOON", "STAR", "RAIN", "SNOW",
            "FIRE", "WIND", "ROCK", "SAND", "LEAF"
        ]
        
        self.medium_words = [
            "APPLE", "TABLE", "CHAIR", "HOUSE", "PHONE",
            "WATER", "LIGHT", "MUSIC", "PAPER", "PLANT",
            "BEACH", "CLOUD", "DREAM", "EARTH", "FRUIT",
            "HAPPY", "SMILE", "DANCE", "LAUGH", "PEACE",
            "MAGIC", "POWER", "BRAVE", "SMART", "QUICK"
        ]
        
        self.hard_words = [
            "COMPUTER", "ELEPHANT", "MOUNTAIN", "UNIVERSE", "KNOWLEDGE",
            "BEAUTIFUL", "ADVENTURE", "CHOCOLATE", "HAPPINESS", "DISCOVERY",
            "CHALLENGE", "WONDERFUL", "EDUCATION", "TECHNOLOGY", "BUTTERFLY",
            "FANTASTIC", "INCREDIBLE", "MYSTERIOUS", "SPECTACULAR", "MAGNIFICENT",
            "EXTRAORDINARY", "CELEBRATION", "IMAGINATION", "TRANSFORMATION", "EXPERIENCE"
        ]
        
        self.current_word = ""
        self.scrambled_word = []
        self.score = 0
        self.time_left = 0
        self.game_state = GameState.SHOWING_ORIGINAL
        self.difficulty = Difficulty.EASY
        self.original_word_time = 20
        self.scrambled_word_time = 25
        self.correct_answers = []
        self.user_answer = ""
        self.is_answer_correct = False
        self.timer_running = False
        self.timer_thread = None
        
        # Progressive difficulty tracking
        self.questions_answered = 0
        self.correct_answers_in_level = 0
        self.total_questions_per_level = 5
        self.starting_difficulty = Difficulty.EASY
        
        # Word tracking to prevent repetition
        self.used_words = set()
        self.available_words = []

    def setup_difficulty(self, difficulty: Difficulty):
        self.difficulty = difficulty
        if difficulty == Difficulty.EASY:
            self.original_word_time = 20
            self.scrambled_word_time = 25
        elif difficulty == Difficulty.MEDIUM:
            self.original_word_time = 30
            self.scrambled_word_time = 35
        else:  # HARD
            self.original_word_time = 40
            self.scrambled_word_time = 45

    def get_word_list_for_difficulty(self):
        if self.difficulty == Difficulty.EASY:
            return self.easy_words.copy()
        elif self.difficulty == Difficulty.MEDIUM:
            return self.medium_words.copy()
        else:
            return self.hard_words.copy()

    def get_questions_for_difficulty(self):
        if self.difficulty == Difficulty.HARD and self.starting_difficulty == Difficulty.HARD:
            return 10  # 10 questions if starting from HARD
        return 5  # 5 questions for all other cases

    def refresh_available_words(self):
        """Refresh available words when starting a new level or running out of words"""
        word_list = self.get_word_list_for_difficulty()
        # Remove already used words from current level
        self.available_words = [word for word in word_list if word not in self.used_words]
        
        # If no words available, reset used words for this difficulty
        if not self.available_words:
            self.used_words.clear()
            self.available_words = word_list.copy()
        
        # Shuffle the available words
        random.shuffle(self.available_words)

    def get_next_word(self):
        """Get next unique word, ensuring no repetition"""
        if not self.available_words:
            self.refresh_available_words()
        
        # Get a random word from available words
        word = self.available_words.pop()
        self.used_words.add(word)
        return word

    def generate_all_valid_answers(self, original_word, scrambled_word):
        """Generate LIMITED valid answer sequences for words with duplicate characters"""
        from itertools import permutations
        
        # Create a mapping of characters to their positions in scrambled word
        char_positions = {}
        for i, (char, block_num) in enumerate(scrambled_word):
            if char not in char_positions:
                char_positions[char] = []
            char_positions[char].append(block_num)
        
        # For each character in original word, get all possible positions
        possible_sequences = []
        for char in original_word:
            if char in char_positions:
                possible_sequences.append(char_positions[char].copy())
            else:
                possible_sequences.append([])
        
        # Generate combinations but LIMIT them to prevent overflow
        def generate_limited_combinations(sequences, current_combo=[], max_combinations=50):
            if not sequences or len(current_combo) >= len(original_word):
                return [current_combo] if len(current_combo) == len(original_word) else []
            
            first_sequence = sequences[0]
            remaining_sequences = sequences[1:]
            all_combos = []
            
            for position in first_sequence:
                if len(all_combos) >= max_combinations:  # LIMIT combinations
                    break
                new_combo = current_combo + [position]
                all_combos.extend(generate_limited_combinations(remaining_sequences, new_combo, max_combinations - len(all_combos)))
            
            return all_combos[:max_combinations]  # Ensure we don't exceed limit
        
        all_combinations = generate_limited_combinations(possible_sequences)
        
        # Convert to string format and remove duplicates, but limit to reasonable number
        valid_answers = list(set([''.join(map(str, combo)) for combo in all_combinations]))
        
        # If too many answers, just return the first few
        if len(valid_answers) > 10:
            valid_answers = valid_answers[:10]
        
        return valid_answers

    def start_new_round(self):
        # Stop any existing timer first
        self.timer_running = False
        if self.timer_thread and self.timer_thread.is_alive():
            try:
                self.timer_thread.join(timeout=1.0)
            except:
                pass
        
        # Get a unique word
        self.current_word = self.get_next_word()
        
        # Create scrambled version with SEQUENTIAL block numbers
        original_chars = list(self.current_word)
        scrambled_chars = original_chars.copy()
        
        # Better shuffling - ensure it's actually scrambled
        max_attempts = 10
        attempts = 0
        while scrambled_chars == original_chars and attempts < max_attempts:
            random.shuffle(scrambled_chars)
            attempts += 1
        
        # If still the same after attempts, manually swap some positions
        if scrambled_chars == original_chars and len(scrambled_chars) > 1:
            # Swap first and last characters
            scrambled_chars[0], scrambled_chars[-1] = scrambled_chars[-1], scrambled_chars[0]
        
        # Assign sequential block numbers (1, 2, 3, 4...)
        self.scrambled_word = []
        for i, char in enumerate(scrambled_chars):
            self.scrambled_word.append((char, i + 1))
        
        # Generate all valid answers for duplicate characters
        self.correct_answers = self.generate_all_valid_answers(self.current_word, self.scrambled_word)
        
        # Reset state
        self.user_answer = ""
        self.is_answer_correct = False
        self.game_state = GameState.SHOWING_ORIGINAL
        self.time_left = self.original_word_time

    def check_answer(self, user_input: str):
        self.user_answer = user_input.strip()
        
        if not self.user_answer:
            return False
        
        # Stop timer immediately when answer is submitted
        self.timer_running = False
        
        # Check if user answer matches any of the valid answers
        self.is_answer_correct = self.user_answer in self.correct_answers
        self.questions_answered += 1
        
        if self.is_answer_correct:
            self.score += 20
            self.correct_answers_in_level += 1
        else:
            self.score = max(0, self.score - 10)
            # Reset progress on wrong answer - go back to starting difficulty
            self.correct_answers_in_level = 0
            self.questions_answered = 0
            self.difficulty = self.starting_difficulty
            self.setup_difficulty(self.difficulty)
            self.used_words.clear()  # Reset used words
            self.available_words = []
            self.game_state = GameState.GAME_OVER
            return True
        
        # Check if level completed
        current_level_questions = self.get_questions_for_difficulty()
        if self.correct_answers_in_level >= current_level_questions:
            if self.difficulty == Difficulty.EASY:
                self.difficulty = Difficulty.MEDIUM
                self.setup_difficulty(self.difficulty)
                self.correct_answers_in_level = 0
                self.used_words.clear()  # Reset used words for new difficulty
                self.available_words = []
            elif self.difficulty == Difficulty.MEDIUM:
                self.difficulty = Difficulty.HARD
                self.setup_difficulty(self.difficulty)
                self.correct_answers_in_level = 0
                self.used_words.clear()  # Reset used words for new difficulty
                self.available_words = []
            else:  # HARD completed
                self.game_state = GameState.VICTORY
                self.timer_running = False  # Ensure timer is stopped
                return True
        
        self.game_state = GameState.SHOWING_RESULT
        return True

    def reset_game(self, starting_difficulty: Difficulty):
        # Stop any running timer
        self.timer_running = False
        if self.timer_thread and self.timer_thread.is_alive():
            try:
                self.timer_thread.join(timeout=1.0)
            except:
                pass
                
        self.starting_difficulty = starting_difficulty
        self.difficulty = starting_difficulty
        self.setup_difficulty(self.difficulty)
        self.score = 0
        self.questions_answered = 0
        self.correct_answers_in_level = 0
        self.used_words.clear()
        self.available_words = []

def main(page: ft.Page):
    page.title = "Flip Flop Word Game"
    page.theme_mode = ft.ThemeMode.LIGHT
    page.vertical_alignment = ft.MainAxisAlignment.START
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER
    page.window_width = 400
    page.window_height = 700
    page.window_resizable = False
    page.padding = 0
    page.spacing = 0
    page.scroll = ft.ScrollMode.AUTO  # Enable scrolling

    game = FlipFlopGame()

    # UI Components
    score_text = ft.Text("Score: 0", size=20, weight=ft.FontWeight.BOLD, color=ft.Colors.WHITE)
    timer_text = ft.Text("Time: 0", size=18, weight=ft.FontWeight.BOLD, color=ft.Colors.WHITE)
    difficulty_text = ft.Text("", size=16, weight=ft.FontWeight.BOLD, color=ft.Colors.WHITE)
    progress_text = ft.Text("", size=14, color=ft.Colors.WHITE)
    game_state_text = ft.Text("", size=18, weight=ft.FontWeight.BOLD, text_align=ft.TextAlign.CENTER, color=ft.Colors.BLACK)
    main_content = ft.Container(expand=True)
    answer_input = ft.TextField(
        hint_text="e.g., 247961835",
        text_align=ft.TextAlign.CENTER,
        text_size=24,
        keyboard_type=ft.KeyboardType.NUMBER,
        width=300,
        height=50,
        content_padding=ft.padding.symmetric(horizontal=10, vertical=15),
        border_radius=10,
        filled=True,
        fill_color=ft.Colors.WHITE,
        border_color=ft.Colors.GREY_400
    )

    skip_button = ft.ElevatedButton(
        "Skip ⏭️",
        on_click=lambda _: skip_timer(),
        style=ft.ButtonStyle(
            bgcolor=ft.Colors.ORANGE_600,
            color=ft.Colors.WHITE,
            padding=ft.padding.symmetric(horizontal=20, vertical=10),
            text_style=ft.TextStyle(size=16),
            shape=ft.RoundedRectangleBorder(radius=20)
        ),
        visible=False
    )

    next_button = ft.ElevatedButton(
        "Next ➡️",
        on_click=lambda _: next_question(),
        style=ft.ButtonStyle(
            bgcolor=ft.Colors.GREEN_600,
            color=ft.Colors.WHITE,
            padding=ft.padding.symmetric(horizontal=30, vertical=15),
            text_style=ft.TextStyle(size=18),
            shape=ft.RoundedRectangleBorder(radius=10)
        ),
        visible=False
    )

    def skip_timer():
        game.timer_running = False
        if game.game_state == GameState.SHOWING_ORIGINAL:
            game.game_state = GameState.SHOWING_SCRAMBLED
            game.time_left = game.scrambled_word_time
            update_game_content()
            start_timer()
        elif game.game_state == GameState.SHOWING_SCRAMBLED:
            game.game_state = GameState.WAITING_FOR_ANSWER
            update_game_content()

    def next_question():
        next_button.visible = False
        start_new_round()

    def timer_worker():
        while game.timer_running:
            try:
                time.sleep(1)
                if not game.timer_running:
                    break
                
                if game.time_left > 0:
                    game.time_left -= 1
                    timer_text.value = f"Time: {game.time_left}"
                    try:
                        page.update()
                    except Exception as e:
                        print(f"Page update error: {e}")
                        break
                else:
                    # Transition to next state
                    if game.game_state == GameState.SHOWING_ORIGINAL:
                        game.game_state = GameState.SHOWING_SCRAMBLED
                        game.time_left = game.scrambled_word_time
                        update_game_content()
                    elif game.game_state == GameState.SHOWING_SCRAMBLED:
                        game.game_state = GameState.WAITING_FOR_ANSWER
                        game.timer_running = False
                        update_game_content()
            except Exception as e:
                print(f"Timer error: {e}")
                # Ensure we don't get stuck in error state
                if game.game_state == GameState.SHOWING_ORIGINAL or game.game_state == GameState.SHOWING_SCRAMBLED:
                    game.game_state = GameState.WAITING_FOR_ANSWER
                    try:
                        update_game_content()
                    except:
                        pass
                break

    def start_timer():
        # Stop any existing timer first
        game.timer_running = False
        if game.timer_thread and game.timer_thread.is_alive():
            try:
                game.timer_thread.join(timeout=1.0)
            except:
                pass
        
        game.timer_running = True
        game.timer_thread = threading.Thread(target=timer_worker, daemon=True)
        try:
            game.timer_thread.start()
        except Exception as e:
            print(f"Timer start error: {e}")

    def stop_timer():
        game.timer_running = False
        if game.timer_thread and game.timer_thread.is_alive():
            try:
                game.timer_thread.join(timeout=1.0)
            except:
                pass

    def update_score():
        score_text.value = f"Score: {game.score}"
        try:
            page.update()
        except:
            pass

    def update_progress():
        current_level_questions = game.get_questions_for_difficulty()
        progress_text.value = f"Level: {game.difficulty.value.upper()} | Progress: {game.correct_answers_in_level}/{current_level_questions}"
        try:
            page.update()
        except:
            pass

    def update_game_state_text():
        if game.game_state == GameState.SHOWING_ORIGINAL:
            game_state_text.value = "Memorize the original word!"
            skip_button.visible = True
        elif game.game_state == GameState.SHOWING_SCRAMBLED:
            game_state_text.value = "Memorize the scrambled word with block numbers!"
            skip_button.visible = True
        elif game.game_state == GameState.WAITING_FOR_ANSWER:
            game_state_text.value = "Enter the sequence of block numbers to unscramble the word"
            skip_button.visible = False
        elif game.game_state == GameState.SHOWING_RESULT:
            if game.is_answer_correct:
                game_state_text.value = "Correct! +20 points"
            else:
                game_state_text.value = "Wrong! -10 points"
            skip_button.visible = False
            next_button.visible = True
        else:
            skip_button.visible = False
            next_button.visible = False
        try:
            page.update()
        except:
            pass

    def create_letter_block(char: str, pos: int):
        return ft.Container(
            content=ft.Column([
                ft.Container(
                    content=ft.Text(
                        char,
                        size=28,
                        weight=ft.FontWeight.BOLD,
                        color=ft.Colors.PURPLE_800
                    ),
                    width=55,
                    height=55,
                    bgcolor=ft.Colors.PURPLE_100,
                    border_radius=10,
                    border=ft.border.all(2, ft.Colors.PURPLE_300),
                    alignment=ft.alignment.center
                ),
                ft.Container(
                    content=ft.Text(
                        str(pos),
                        size=14,
                        weight=ft.FontWeight.BOLD,
                        color=ft.Colors.PURPLE_800
                    ),
                    alignment=ft.alignment.center,
                    margin=ft.margin.only(top=3)
                )
            ], 
            horizontal_alignment=ft.CrossAxisAlignment.CENTER,
            spacing=0),
            margin=ft.margin.all(3)
        )

    def build_original_word_display():
        return ft.Container(
            content=ft.Column([
                ft.Text("Original Word", size=22, weight=ft.FontWeight.BOLD, color=ft.Colors.BLACK),
                ft.Container(height=20),
                ft.Container(
                    content=ft.Text(
                        game.current_word,
                        size=36,
                        weight=ft.FontWeight.BOLD,
                        color=ft.Colors.PURPLE_800
                    ),
                    padding=ft.padding.symmetric(horizontal=20, vertical=25),
                    bgcolor=ft.Colors.PURPLE_50,
                    border_radius=15,
                    alignment=ft.alignment.center,
                    shadow=ft.BoxShadow(
                        spread_radius=1,
                        blur_radius=5,
                        color=ft.Colors.with_opacity(0.1, ft.Colors.BLACK),
                        offset=ft.Offset(0, 2)
                    )
                ),
                ft.Container(height=20),
                skip_button
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            alignment=ft.alignment.center,
            expand=True
        )

    def build_scrambled_word_display():
        letter_blocks = []
        for char, pos in game.scrambled_word:
            letter_blocks.append(create_letter_block(char, pos))
        
        rows = []
        for i in range(0, len(letter_blocks), 5):
            row_blocks = letter_blocks[i:i+5]
            rows.append(
                ft.Row(
                    row_blocks,
                    alignment=ft.MainAxisAlignment.CENTER,
                    spacing=8
                )
            )
        
        return ft.Container(
            content=ft.Column([
                ft.Text(
                    "Scrambled Word with Block Numbers",
                    size=18,
                    weight=ft.FontWeight.BOLD,
                    text_align=ft.TextAlign.CENTER,
                    color=ft.Colors.BLACK
                ),
                ft.Container(height=20),
                ft.Column(
                    rows,
                    spacing=12,
                    horizontal_alignment=ft.CrossAxisAlignment.CENTER
                ),
                ft.Container(height=20),
                skip_button
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            alignment=ft.alignment.center,
            expand=True
        )

    def build_answer_input():
        # Check if word has duplicate characters
        has_duplicates = len(set(game.current_word)) < len(game.current_word)
        hint_text = "Multiple answers possible!" if has_duplicates else "Enter sequence..."
        
        return ft.Container(
            content=ft.Column([
                ft.Text(
                    "Enter the sequence of block numbers\nto unscramble the word:",
                    size=16,
                    weight=ft.FontWeight.BOLD,
                    text_align=ft.TextAlign.CENTER,
                    color=ft.Colors.BLACK
                ),
                ft.Container(height=10),
                # Show hint for duplicate characters
                ft.Text(
                    hint_text,
                    size=14,
                    italic=True,
                    text_align=ft.TextAlign.CENTER,
                    color=ft.Colors.BLUE_600 if has_duplicates else ft.Colors.GREY_600
                ) if has_duplicates else ft.Container(height=0),
                ft.Container(height=15),
                answer_input,
                ft.Container(height=15),
                ft.ElevatedButton(
                    "Submit",
                    on_click=lambda _: check_answer_click(),
                    style=ft.ButtonStyle(
                        bgcolor=ft.Colors.PURPLE_700,
                        color=ft.Colors.WHITE,
                        padding=ft.padding.symmetric(horizontal=40, vertical=15),
                        text_style=ft.TextStyle(size=18),
                        shape=ft.RoundedRectangleBorder(radius=5)
                    )
                ),
                ft.Container(height=20),
                ft.Text(
                    f"Original word had {len(game.current_word)} letters",
                    size=14,
                    italic=True,
                    color=ft.Colors.GREY_600
                )
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            alignment=ft.alignment.center,
            expand=True
        )

    def build_result_display():
        icon_color = ft.Colors.GREEN if game.is_answer_correct else ft.Colors.RED
        icon_name = ft.Icons.CHECK_CIRCLE if game.is_answer_correct else ft.Icons.CANCEL
        
        # Show LIMITED valid answers for words with duplicates
        valid_answers_text = ""
        if len(game.correct_answers) > 1:
            # Show only first 5 answers if there are many
            display_answers = game.correct_answers[:5]
            valid_answers_text = f"Valid Answers: {', '.join(display_answers)}"
            if len(game.correct_answers) > 5:
                valid_answers_text += f" (+{len(game.correct_answers) - 5} more)"
        else:
            valid_answers_text = f"Correct Answer: {game.correct_answers[0]}"
        
        return ft.Container(
            content=ft.Column([
                ft.Icon(icon_name, size=70, color=icon_color),
                ft.Container(height=15),
                ft.Text(
                    "Correct!" if game.is_answer_correct else "Wrong!",
                    size=26,
                    weight=ft.FontWeight.BOLD,
                    color=icon_color
                ),
                ft.Container(height=20),
                ft.Container(
                    content=ft.Column([
                        ft.Text("Original Word:", size=16, weight=ft.FontWeight.BOLD, color=ft.Colors.BLACK),
                        ft.Text(game.current_word, size=20, weight=ft.FontWeight.BOLD, color=ft.Colors.BLACK),
                        ft.Container(height=8),
                        ft.Text("Valid Answers:" if len(game.correct_answers) > 1 else "Correct Answer:", 
                               size=16, weight=ft.FontWeight.BOLD, color=ft.Colors.BLACK),
                        ft.Text(valid_answers_text, size=14, weight=ft.FontWeight.BOLD, color=ft.Colors.BLUE_700),
                        ft.Container(height=8),
                        ft.Text("Your Answer:", size=16, weight=ft.FontWeight.BOLD, color=ft.Colors.BLACK),
                        ft.Text(
                            game.user_answer,
                            size=20,
                            weight=ft.FontWeight.BOLD,
                            color=icon_color
                        )
                    ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
                    padding=12,
                    bgcolor=ft.Colors.GREY_200,
                    border_radius=10
                ),
                ft.Container(height=20),
                next_button
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            alignment=ft.alignment.center,
            expand=True
        )

    def build_game_over_display():
        return ft.Container(
            content=ft.Column([
                ft.Text("😢", size=80),
                ft.Container(height=20),
                ft.Text(
                    "Try Again!",
                    size=32,
                    weight=ft.FontWeight.BOLD,
                    color=ft.Colors.RED_700
                ),
                ft.Container(height=15),
                ft.Text(
                    "Oops! You got one wrong.\nYou need to start over!",
                    size=18,
                    text_align=ft.TextAlign.CENTER,
                    color=ft.Colors.BLACK
                ),
                ft.Container(height=30),
                ft.ElevatedButton(
                    "Try Again",
                    on_click=lambda _: restart_game(),
                    style=ft.ButtonStyle(
                        bgcolor=ft.Colors.BLUE_600,
                        color=ft.Colors.WHITE,
                        padding=ft.padding.symmetric(horizontal=40, vertical=15),
                        text_style=ft.TextStyle(size=20),
                        shape=ft.RoundedRectangleBorder(radius=10)
                    )
                ),
                ft.Container(height=15),
                ft.ElevatedButton(
                    "Main Menu",
                    on_click=lambda _: show_menu(),
                    style=ft.ButtonStyle(
                        bgcolor=ft.Colors.GREY_600,
                        color=ft.Colors.WHITE,
                        padding=ft.padding.symmetric(horizontal=40, vertical=15),
                        text_style=ft.TextStyle(size=18),
                        shape=ft.RoundedRectangleBorder(radius=10)
                    )
                )
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            alignment=ft.alignment.center,
            expand=True
        )

    def build_victory_display():
        return ft.Container(
            content=ft.Column([
                ft.Text("🏆", size=100),
                ft.Container(height=20),
                ft.Text(
                    "CONGRATULATIONS!",
                    size=28,
                    weight=ft.FontWeight.BOLD,
                    color=ft.Colors.GOLD
                ),
                ft.Container(height=15),
                ft.Text(
                    "You completed all levels!\nYou are a Word Master!",
                    size=18,
                    text_align=ft.TextAlign.CENTER,
                    color=ft.Colors.BLACK
                ),
                ft.Container(height=20),
                ft.Text(
                    f"Final Score: {game.score}",
                    size=24,
                    weight=ft.FontWeight.BOLD,
                    color=ft.Colors.PURPLE_700
                ),
                ft.Container(height=30),
                ft.ElevatedButton(
                    "Play Again",
                    on_click=lambda _: show_menu(),
                    style=ft.ButtonStyle(
                        bgcolor=ft.Colors.GREEN_600,
                        color=ft.Colors.WHITE,
                        padding=ft.padding.symmetric(horizontal=40, vertical=15),
                        text_style=ft.TextStyle(size=20),
                        shape=ft.RoundedRectangleBorder(radius=10)
                    )
                ),
                ft.Container(height=15),
                ft.ElevatedButton(
                    "Main Menu",
                    on_click=lambda _: show_menu(),
                    style=ft.ButtonStyle(
                        bgcolor=ft.Colors.GREY_600,
                        color=ft.Colors.WHITE,
                        padding=ft.padding.symmetric(horizontal=40, vertical=15),
                        text_style=ft.TextStyle(size=18),
                        shape=ft.RoundedRectangleBorder(radius=10)
                    )
                )
            ], horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            alignment=ft.alignment.center,
            expand=True
        )

    def update_game_content():
        try:
            if game.game_state == GameState.SHOWING_ORIGINAL:
                main_content.content = build_original_word_display()
            elif game.game_state == GameState.SHOWING_SCRAMBLED:
                main_content.content = build_scrambled_word_display()
            elif game.game_state == GameState.WAITING_FOR_ANSWER:
                main_content.content = build_answer_input()
            elif game.game_state == GameState.SHOWING_RESULT:
                main_content.content = build_result_display()
            elif game.game_state == GameState.GAME_OVER:
                main_content.content = build_game_over_display()
            elif game.game_state == GameState.VICTORY:
                # Ensure timer is stopped for victory
                stop_timer()
                main_content.content = build_victory_display()
        
            update_game_state_text()
            update_progress()
            page.update()
        except Exception as e:
            print(f"Update error: {e}")

    def check_answer_click():
        if game.check_answer(answer_input.value):
            answer_input.value = ""
            update_score()
            update_game_content()

    def start_new_round():
        stop_timer()
        game.start_new_round()
        timer_text.value = f"Time: {game.time_left}"
        update_game_content()
        start_timer()

    def restart_game():
        stop_timer()
        game.reset_game(game.starting_difficulty)
        update_score()
        start_new_round()

    def start_game(starting_difficulty: Difficulty):
        stop_timer()
        game.reset_game(starting_difficulty)
        update_score()
        
        # Hide menu and show game
        page.controls.clear()
        page.add(
            ft.Column([
                # Enhanced App Bar with better visibility
                ft.Container(
                    content=ft.Column([
                        ft.Row([
                            ft.IconButton(
                                ft.Icons.ARROW_BACK,
                                on_click=lambda _: show_menu(),
                                icon_color=ft.Colors.WHITE,
                                icon_size=24
                            ),
                            ft.Text(
                                "FLIP FLOP WORD GAME",
                                size=16,
                                weight=ft.FontWeight.BOLD,
                                color=ft.Colors.WHITE,
                                expand=True
                            ),
                            timer_text
                        ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                        ft.Row([
                            score_text,
                            progress_text
                        ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN)
                    ]),
                    bgcolor=ft.Colors.PURPLE_700,
                    padding=ft.padding.all(12),
                    margin=ft.margin.only(bottom=10)
                ),
                
                # Game state indicator
                ft.Container(
                    content=game_state_text,
                    padding=ft.padding.symmetric(horizontal=15, vertical=8),
                    bgcolor=ft.Colors.GREY_200,
                    border_radius=10,
                    margin=ft.margin.symmetric(horizontal=16, vertical=5)
                ),
                
                # Main content
                main_content
            ], 
            expand=True,
            scroll=ft.ScrollMode.AUTO  # Make content scrollable
            )
        )
        
        start_new_round()

    def show_menu():
        stop_timer()
        page.controls.clear()
        page.add(
            ft.Container(
                content=ft.Column([
                    ft.Container(height=50),  # Top padding for mobile
                    ft.Text(
                        "FLIP FLOP\nWORD GAME",
                        size=36,
                        weight=ft.FontWeight.BOLD,
                        color=ft.Colors.WHITE,
                        text_align=ft.TextAlign.CENTER
                    ),
                    ft.Container(height=40),
                    
                    ft.Text(
                        "Choose Your Starting Level:",
                        size=20,
                        weight=ft.FontWeight.BOLD,
                        color=ft.Colors.WHITE,
                        text_align=ft.TextAlign.CENTER
                    ),
                    ft.Container(height=30),
                    
                    ft.ElevatedButton(
                        "EASY",
                        on_click=lambda _: start_game(Difficulty.EASY),
                        style=ft.ButtonStyle(
                            bgcolor=ft.Colors.GREEN_600,
                            color=ft.Colors.WHITE,
                            padding=ft.padding.symmetric(horizontal=50, vertical=15),
                            text_style=ft.TextStyle(size=20, weight=ft.FontWeight.BOLD),
                            shape=ft.RoundedRectangleBorder(radius=25)
                        ),
                        width=200
                    ),
                    ft.Container(height=15),
                    
                    ft.ElevatedButton(
                        "MEDIUM",
                        on_click=lambda _: start_game(Difficulty.MEDIUM),
                        style=ft.ButtonStyle(
                            bgcolor=ft.Colors.ORANGE_600,
                            color=ft.Colors.WHITE,
                            padding=ft.padding.symmetric(horizontal=50, vertical=15),
                            text_style=ft.TextStyle(size=20, weight=ft.FontWeight.BOLD),
                            shape=ft.RoundedRectangleBorder(radius=25)
                        ),
                        width=200
                    ),
                    ft.Container(height=15),
                    
                    ft.ElevatedButton(
                        "HARD",
                        on_click=lambda _: start_game(Difficulty.HARD),
                        style=ft.ButtonStyle(
                            bgcolor=ft.Colors.RED_600,
                            color=ft.Colors.WHITE,
                            padding=ft.padding.symmetric(horizontal=50, vertical=15),
                            text_style=ft.TextStyle(size=20, weight=ft.FontWeight.BOLD),
                            shape=ft.RoundedRectangleBorder(radius=25)
                        ),
                        width=200
                    ),
                    ft.Container(height=30),
                    
                    ft.Container(
                        content=ft.Text(
                            "🎯 GAME RULES 🎯\n\n"
                            "📈 EASY → MEDIUM → HARD: Complete 5 questions each level\n"
                            "🔥 MEDIUM → HARD: Skip Easy, 5 questions each level\n"
                            "💪 HARD ONLY: 10 challenging questions\n\n"
                            "🔤 Words with duplicate letters have multiple valid answers!\n"
                            "❌ One wrong answer = Restart from your chosen level!\n"
                            "🏆 Complete all levels = Victory Trophy!\n\n"
                            "Instructions:\n"
                            "1. Memorize the original word\n"
                            "2. Memorize scrambled word + numbers\n"
                            "3. Enter the sequence to unscramble\n\n"
                            "✅ Correct: +20 points\n"
                            "❌ Wrong: -10 points",
                            size=12,
                            color=ft.Colors.WHITE,
                            text_align=ft.TextAlign.CENTER
                        ),
                        padding=15,
                        bgcolor=ft.Colors.with_opacity(0.2, ft.Colors.WHITE),
                        border_radius=10,
                        width=350
                    )
                ], 
                horizontal_alignment=ft.CrossAxisAlignment.CENTER,
                scroll=ft.ScrollMode.AUTO  # Make menu scrollable too
                ),
                gradient=ft.LinearGradient(
                    begin=ft.alignment.top_center,
                    end=ft.alignment.bottom_center,
                    colors=[ft.Colors.PURPLE_300, ft.Colors.PURPLE_800]
                ),
                padding=20,
                expand=True,
                alignment=ft.alignment.center
            )
        )
        page.update()

    # Initialize the app
    show_menu()
if __name__ == "__main__":
 ft.app(target=main, view=ft.AppView.WEB_BROWSER, route_url_strategy="hash")
##if __name__ == "__main__":
    ##ft.app(target=main)
