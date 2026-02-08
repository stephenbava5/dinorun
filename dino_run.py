import pygame
import sys

# Initialize Pygame
pygame.init()

# Screen dimensions
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600

# Jungle-themed colors
DARK_GREEN = (34, 87, 35)        # Dark jungle green
LIGHT_GREEN = (76, 175, 80)      # Light jungle green
GOLDEN = (255, 193, 7)           # Golden/sun color
BROWN = (101, 67, 33)            # Tree brown
DARK_BROWN = (62, 39, 35)        # Dark brown
WHITE = (255, 255, 255)          # Text color

# Create the game window
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Dino Run - Jungle Adventure")

# Clock for frame rate
clock = pygame.time.Clock()
FPS = 60

# Font for text
title_font = pygame.font.Font(None, 80)
subtitle_font = pygame.font.Font(None, 40)
text_font = pygame.font.Font(None, 30)

class Game:
    def __init__(self):
        self.game_state = "welcome"  # States: welcome, playing, game_over
        self.score = 0
        self.obstacles_dodged = 0
        
    def draw_welcome_screen(self):
        """Draw the welcome/start screen with jungle theme"""
        # Draw jungle background gradient effect with green
        for y in range(SCREEN_HEIGHT):
            # Create a gradient from dark to light green
            ratio = y / SCREEN_HEIGHT
            r = int(DARK_GREEN[0] + (LIGHT_GREEN[0] - DARK_GREEN[0]) * ratio)
            g = int(DARK_GREEN[1] + (LIGHT_GREEN[1] - DARK_GREEN[1]) * ratio)
            b = int(DARK_GREEN[2] + (LIGHT_GREEN[2] - DARK_GREEN[2]) * ratio)
            pygame.draw.line(screen, (r, g, b), (0, y), (SCREEN_WIDTH, y))
        
        # Draw decorative vines (brown lines)
        for i in range(3):
            pygame.draw.line(screen, BROWN, (50 + i * 300, 0), 
                           (100 + i * 300, SCREEN_HEIGHT), 8)
        
        # Title
        title_text = title_font.render("DINO RUN", True, GOLDEN)
        title_shadow = title_font.render("DINO RUN", True, DARK_BROWN)
        screen.blit(title_shadow, (SCREEN_WIDTH//2 - title_text.get_width()//2 + 3, 
                                   75 + 3))
        screen.blit(title_text, (SCREEN_WIDTH//2 - title_text.get_width()//2, 75))
        
        # Subtitle
        subtitle_text = subtitle_font.render("Jungle Adventure", True, WHITE)
        screen.blit(subtitle_text, (SCREEN_WIDTH//2 - subtitle_text.get_width()//2, 160))
        
        # Instructions
        instructions = [
            "A dinosaur is chasing you through the jungle!",
            "Avoid obstacles and survive as long as you can!",
            "",
            "Press SPACE to Start",
            "Press ESC to Quit"
        ]
        
        y_pos = 300
        for instruction in instructions:
            if instruction:  # Skip empty lines for spacing
                text = text_font.render(instruction, True, WHITE)
                screen.blit(text, (SCREEN_WIDTH//2 - text.get_width()//2, y_pos))
            y_pos += 50
        
        # Footer with hint
        footer_text = text_font.render("Help your son learn Python game development!", 
                                      True, GOLDEN)
        screen.blit(footer_text, (SCREEN_WIDTH//2 - footer_text.get_width()//2, 
                                 SCREEN_HEIGHT - 40))
    
    def draw_game_screen(self):
        """Draw the main game screen"""
        # For now, just show a placeholder
        screen.fill(DARK_GREEN)
        
        # Draw some jungle elements
        pygame.draw.rect(screen, BROWN, (0, SCREEN_HEIGHT - 100, SCREEN_WIDTH, 100))
        
        # Game title at top
        title = text_font.render(f"Score: {self.score} | Obstacles Dodged: {self.obstacles_dodged}", 
                                True, GOLDEN)
        screen.blit(title, (20, 20))
        
        # Placeholder message
        placeholder = subtitle_font.render("Game coming soon!", True, WHITE)
        screen.blit(placeholder, (SCREEN_WIDTH//2 - placeholder.get_width()//2, 
                                 SCREEN_HEIGHT//2 - 50))
        
        hint = text_font.render("Press ESC to return to welcome screen", True, WHITE)
        screen.blit(hint, (SCREEN_WIDTH//2 - hint.get_width()//2, 
                          SCREEN_HEIGHT//2 + 50))
    
    def handle_events(self):
        """Handle user input and window events"""
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    if self.game_state == "playing":
                        self.game_state = "welcome"
                    else:
                        return False
                
                if event.key == pygame.K_SPACE:
                    if self.game_state == "welcome":
                        self.game_state = "playing"
                        self.reset_game()
        
        return True
    
    def reset_game(self):
        """Reset game variables for a new game"""
        self.score = 0
        self.obstacles_dodged = 0
    
    def update(self):
        """Update game logic"""
        if self.game_state == "playing":
            # This is where we'll add game logic later
            self.score += 1  # Simple placeholder
    
    def draw(self):
        """Draw the current screen"""
        if self.game_state == "welcome":
            self.draw_welcome_screen()
        elif self.game_state == "playing":
            self.draw_game_screen()
        
        pygame.display.flip()

def main():
    """Main game loop"""
    game = Game()
    running = True
    
    print("=" * 50)
    print("Welcome to Dino Run Game!")
    print("=" * 50)
    print("This game teaches Python programming concepts.")
    print("Watch as the game appears on screen...")
    print("=" * 50)
    
    while running:
        running = game.handle_events()
        game.update()
        game.draw()
        clock.tick(FPS)
    
    pygame.quit()
    print("\nThanks for playing Dino Run!")
    sys.exit()

if __name__ == "__main__":
    main()
