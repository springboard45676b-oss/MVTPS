# filename: flipflopgame.py

import random
from kivy.app import App
from kivy.clock import Clock
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.screenmanager import ScreenManager, Screen

# Sample word list
WORDS = ["PYTHON", "KIVY", "ANDROID", "SCRAMBLE", "MEMORY", "DEVELOPER"]

class StartScreen(Screen):
    def __init__(self, **kwargs):
        super(StartScreen, self).__init__(**kwargs)
        layout = BoxLayout(orientation='vertical')
        self.label = Label(text="Welcome to Flip-Flop Word Game!", font_size=32)
        start_button = Button(text="Start Game", size_hint=(1, 0.2))
        start_button.bind(on_release=self.start_game)
        layout.add_widget(self.label)
        layout.add_widget(start_button)
        self.add_widget(layout)

    def start_game(self, instance):
        self.manager.current = 'show_word'
        self.manager.get_screen('show_word').start_showing_word()

class ShowWordScreen(Screen):
    def __init__(self, **kwargs):
        super(ShowWordScreen, self).__init__(**kwargs)
        self.layout = BoxLayout(orientation='vertical')
        self.word_label = Label(text="", font_size=48)
        self.layout.add_widget(self.word_label)
        self.add_widget(self.layout)

    def start_showing_word(self):
        self.manager.current_word = random.choice(WORDS)
        self.word_label.text = self.manager.current_word
        Clock.schedule_once(self.goto_scrambled_word, 50)  # 50 seconds

    def goto_scrambled_word(self, dt):
        self.manager.current = 'scrambled_word'
        self.manager.get_screen('scrambled_word').start_scrambled()

class ScrambledWordScreen(Screen):
    def __init__(self, **kwargs):
        super(ScrambledWordScreen, self).__init__(**kwargs)
        self.layout = GridLayout(cols=4, spacing=10, padding=20)
        self.add_widget(self.layout)

    def start_scrambled(self):
        self.layout.clear_widgets()
        word = self.manager.current_word
        self.scrambled_letters = list(word)
        random.shuffle(self.scrambled_letters)
        self.block_positions = {}  # block_num : letter

        for idx, letter in enumerate(self.scrambled_letters):
            btn = Button(text=letter, font_size=32)
            self.layout.add_widget(btn)
            self.block_positions[idx+1] = letter  # 1-indexed

        Clock.schedule_once(self.goto_input_screen, 60)  # 60 seconds

    def goto_input_screen(self, dt):
        self.manager.scrambled_order = self.scrambled_letters
        self.manager.block_mapping = self.block_positions
        self.manager.current = 'input_screen'

class InputScreen(Screen):
    def __init__(self, **kwargs):
        super(InputScreen, self).__init__(**kwargs)
        self.layout = BoxLayout(orientation='vertical', padding=20, spacing=20)
        self.label = Label(text="Enter block numbers separated by commas to form original word", font_size=24)
        self.input = TextInput(multiline=False, font_size=24, hint_text="e.g., 2,1,3,4...")
        self.submit_btn = Button(text="Submit", size_hint=(1, 0.3), font_size=24)
        self.submit_btn.bind(on_release=self.check_answer)
        self.result_label = Label(text="", font_size=24)

        self.layout.add_widget(self.label)
        self.layout.add_widget(self.input)
        self.layout.add_widget(self.submit_btn)
        self.layout.add_widget(self.result_label)
        self.add_widget(self.layout)

    def check_answer(self, instance):
        user_input = self.input.text.strip()
        if not user_input:
            self.result_label.text = "Please enter a sequence!"
            return

        try:
            block_nums = [int(num.strip()) for num in user_input.split(",")]
        except ValueError:
            self.result_label.text = "Invalid input format. Use commas!"
            return

        reconstructed = ""
        scrambled = self.manager.scrambled_order
        for num in block_nums:
            if num < 1 or num > len(scrambled):
                self.result_label.text = f"Invalid block number: {num}"
                return
            reconstructed += scrambled[num-1]

        if reconstructed.upper() == self.manager.current_word.upper():
            self.result_label.text = "Correct! 🎉"
        else:
            self.result_label.text = f"Wrong! The word was: {self.manager.current_word}"

class FlipFlopApp(App):
    def build(self):
        sm = ScreenManager()
        sm.add_widget(StartScreen(name='start'))
        sm.add_widget(ShowWordScreen(name='show_word'))
        sm.add_widget(ScrambledWordScreen(name='scrambled_word'))
        sm.add_widget(InputScreen(name='input_screen'))
        return sm

if __name__ == '__main__':
    FlipFlopApp().run()
