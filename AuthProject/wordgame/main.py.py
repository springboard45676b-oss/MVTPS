import os
import random
from kivy.app import App
from kivy.clock import Clock
from kivy.core.audio import SoundLoader
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.textinput import TextInput
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.uix.floatlayout import FloatLayout
from kivy.graphics import Rectangle, Color

WORDS = ["PYTHON", "KIVY", "ANDROID", "SCRAMBLE", "MEMORY", "DEVELOPER"]

class StartScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        fl = FloatLayout()
        with fl.canvas.before:
            Color(0.2, 0.3, 0.5, 1)
            self.bg = Rectangle(size=self.size, pos=self.pos)
            fl.bind(size=self._update_bg, pos=self._update_bg)

        layout = BoxLayout(orientation='vertical', padding=50, spacing=20, size_hint=(0.9, 0.9), pos_hint={'center_x':0.5, 'center_y':0.5})
        label = Label(text="Welcome to Flip-Flop Word Game!", font_size=32)
        start_button = Button(text="Start Game", size_hint=(1, 0.2), font_size=24)
        start_button.bind(on_release=self.start_game)

        settings_button = Button(text="Settings", size_hint=(1, 0.2), font_size=24)
        settings_button.bind(on_release=self.open_settings)

        layout.add_widget(label)
        layout.add_widget(start_button)
        layout.add_widget(settings_button)
        fl.add_widget(layout)
        self.add_widget(fl)

    def _update_bg(self, instance, value):
        self.bg.size = instance.size
        self.bg.pos = instance.pos

    def start_game(self, instance):
        self.manager.current = 'show_word'
        self.manager.get_screen('show_word').start_showing_word()

    def open_settings(self, instance):
        self.manager.current = 'settings'

class SettingsScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        layout = BoxLayout(orientation='vertical', spacing=20, padding=40)
        label = Label(text="Settings", font_size=32)
        back_button = Button(text="Back to Menu", size_hint=(1, 0.2), font_size=24)
        back_button.bind(on_release=self.back_to_menu)

        layout.add_widget(label)
        layout.add_widget(back_button)
        self.add_widget(layout)

    def back_to_menu(self, instance):
        self.manager.current = 'start'

class ShowWordScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        layout = BoxLayout(orientation='vertical', spacing=20, padding=20)
        self.timer_label = Label(text="Time Left: 50", font_size=24)
        self.word_label = Label(text="", font_size=48)
        self.proceed_button = Button(text="Proceed Now", size_hint=(1, 0.2), font_size=24)
        self.proceed_button.bind(on_release=self.proceed_now)

        layout.add_widget(self.timer_label)
        layout.add_widget(self.word_label)
        layout.add_widget(self.proceed_button)
        self.add_widget(layout)

    def start_showing_word(self):
        self.manager.current_word = random.choice(WORDS)
        self.word_label.text = self.manager.current_word
        self.time_left = max(50 - (self.manager.level - 1) * 5, 10)
        Clock.schedule_interval(self.update_timer, 1)
        Clock.schedule_once(self.goto_scrambled_word, self.time_left)

    def update_timer(self, dt):
        self.time_left -= 1
        self.timer_label.text = f"Time Left: {self.time_left}"
        if self.time_left <= 0:
            Clock.unschedule(self.update_timer)

    def goto_scrambled_word(self, dt):
        self.manager.current = 'scrambled_word'
        self.manager.get_screen('scrambled_word').start_scrambled()

    def proceed_now(self, instance):
        self.manager.current = 'scrambled_word'
        self.manager.get_screen('scrambled_word').start_scrambled()

class ScrambledWordScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.layout = BoxLayout(orientation='vertical', padding=20, spacing=20)
        self.grid = GridLayout(cols=4, spacing=10, size_hint=(1, 0.8))
        self.timer_label = Label(text="Time Left: 60", font_size=24, size_hint=(1, 0.1))
        self.confidence_button = Button(text="I'm Confident!", size_hint=(0.5, 0.1), font_size=24)
        self.confidence_button.bind(on_release=self.goto_input_screen)

        self.layout.add_widget(self.timer_label)
        self.layout.add_widget(self.grid)
        self.layout.add_widget(self.confidence_button)
        self.add_widget(self.layout)

    def start_scrambled(self):
        self.grid.clear_widgets()
        word = self.manager.current_word
        self.scrambled_letters = list(word)
        random.shuffle(self.scrambled_letters)
        self.block_positions = {}

        for idx, letter in enumerate(self.scrambled_letters):
            self.grid.add_widget(Button(text=letter, font_size=32))
            self.grid.add_widget(Label(text=str(idx + 1), font_size=18))
            self.block_positions[idx + 1] = letter

        self.manager.scrambled_order = self.scrambled_letters
        self.manager.block_mapping = self.block_positions

        self.time_left = max(60 - (self.manager.level - 1) * 5, 10)
        Clock.schedule_interval(self.update_timer, 1)
        Clock.schedule_once(self.goto_input_screen, self.time_left)

    def update_timer(self, dt):
        self.time_left -= 1
        self.timer_label.text = f"Time Left: {self.time_left}"
        if self.time_left <= 0:
            Clock.unschedule(self.update_timer)

    def goto_input_screen(self, *args):
        self.manager.current = 'input_screen'

class InputScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        layout = BoxLayout(orientation='vertical', spacing=20, padding=20)
        label = Label(text="Enter block numbers separated by commas", font_size=24)
        self.input = TextInput(hint_text="e.g., 2,1,3", multiline=False, font_size=24)
        submit = Button(text="Submit", font_size=24, size_hint=(1, 0.2))
        submit.bind(on_release=self.check_answer)
        self.result_label = Label(text="", font_size=24)

        layout.add_widget(label)
        layout.add_widget(self.input)
        layout.add_widget(submit)
        layout.add_widget(self.result_label)
        self.add_widget(layout)

    def check_answer(self, instance):
        try:
            block_nums = [int(x.strip()) for x in self.input.text.strip().split(",")]
            scrambled = self.manager.scrambled_order
            reconstructed = ''.join(scrambled[i-1] for i in block_nums)
            if reconstructed.upper() == self.manager.current_word.upper():
                self.manager.level += 1
                self.manager.get_screen('result').update_result("Correct! 🎉", success=True)
            else:
                self.manager.get_screen('result').update_result(f"Wrong! The word was: {self.manager.current_word}", success=False)
            self.manager.current = 'result'
        except Exception:
            self.result_label.text = "Invalid input. Please use comma-separated numbers."

class ResultScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        layout = BoxLayout(orientation='vertical', spacing=20, padding=20)
        self.result_label = Label(text="", font_size=48, bold=True)
        self.replay_btn = Button(text="Replay", size_hint=(0.5, 0.2), font_size=24)
        self.highscore_btn = Button(text="High Score", size_hint=(0.5, 0.2), font_size=24)
        self.exit_btn = Button(text="Exit", size_hint=(0.5, 0.2), font_size=24)

        self.replay_btn.bind(on_release=self.replay_game)
        self.highscore_btn.bind(on_release=self.goto_highscore)
        self.exit_btn.bind(on_release=App.get_running_app().stop)

        layout.add_widget(self.result_label)
        layout.add_widget(self.replay_btn)
        layout.add_widget(self.highscore_btn)
        layout.add_widget(self.exit_btn)
        self.add_widget(layout)

    def update_result(self, message, success):
        self.result_label.text = message
        self.result_label.color = (0, 1, 0, 1) if success else (1, 0, 0, 1)
        sound_file = 'win.wav' if success else 'lose.wav'
        sound = SoundLoader.load(sound_file)
        if sound:
            sound.play()

    def replay_game(self, instance):
        self.manager.level = 1
        self.manager.current = 'start'

    def goto_highscore(self, instance):
        self.manager.current = 'highscore'

class HighscoreScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        layout = BoxLayout(orientation='vertical', padding=20, spacing=20)
        self.label = Label(text="High Score: 0", font_size=32)
        self.menu_button = Button(text="Back to Menu", size_hint=(1, 0.2), font_size=24)
        self.menu_button.bind(on_release=self.back_to_menu)
        layout.add_widget(self.label)
        layout.add_widget(self.menu_button)
        self.add_widget(layout)

    def on_pre_enter(self):
        highscore = self.load_highscore()
        current_score = self.manager.level - 1
        if current_score > highscore:
            self.save_highscore(current_score)
            highscore = current_score
        self.label.text = f"High Score: {highscore}"

    def load_highscore(self):
        if os.path.exists("highscore.txt"):
            with open("highscore.txt", "r") as f:
                return int(f.read())
        return 0

    def save_highscore(self, score):
        with open("highscore.txt", "w") as f:
            f.write(str(score))

    def back_to_menu(self, instance):
        self.manager.current = 'start'

class FlipFlopApp(App):
    def build(self):
        sm = ScreenManager()
        sm.level = 1
        sm.add_widget(StartScreen(name='start'))
        sm.add_widget(ShowWordScreen(name='show_word'))
        sm.add_widget(ScrambledWordScreen(name='scrambled_word'))
        sm.add_widget(InputScreen(name='input_screen'))
        sm.add_widget(ResultScreen(name='result'))
        sm.add_widget(HighscoreScreen(name='highscore'))
        sm.add_widget(SettingsScreen(name='settings'))  # New screen added
        return sm

if __name__ == '__main__':
    FlipFlopApp().run()
