// AI Assistant Login Form JavaScript
class AIAssistantLoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.submitButton = this.form.querySelector('.neural-button');
        this.successMessage = document.getElementById('successMessage');
        this.socialButtons = document.querySelectorAll('.social-neural');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupPasswordToggle();
        this.setupSocialButtons();
        this.setupAIEffects();
    }
    
    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        this.emailInput.addEventListener('input', () => this.clearError('email'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
        
        // Add placeholder for label animations
        this.emailInput.setAttribute('placeholder', ' ');
        this.passwordInput.setAttribute('placeholder', ' ');
    }
    
    setupPasswordToggle() {
        this.passwordToggle.addEventListener('click', () => {
            const type = this.passwordInput.type === 'password' ? 'text' : 'password';
            this.passwordInput.type = type;
            
            this.passwordToggle.classList.toggle('toggle-active', type === 'text');
        });
    }
    
    setupSocialButtons() {
        this.socialButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const provider = button.querySelector('span').textContent.trim();
                this.handleSocialLogin(provider, button);
            });
        });
    }
    
    setupAIEffects() {
        // Add neural connection effect on input focus
        [this.emailInput, this.passwordInput].forEach(input => {
            input.addEventListener('focus', (e) => {
                this.triggerNeuralEffect(e.target.closest('.smart-field'));
            });
        });
    }
    
    triggerNeuralEffect(field) {
        // Add subtle AI processing effect
        const indicator = field.querySelector('.ai-indicator');
        indicator.style.opacity = '1';
        
        setTimeout(() => {
            indicator.style.opacity = '';
        }, 2000);
    }
    
    validateEmail() {
        const email = this.emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            this.showError('email', 'Neural access requires email address');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            this.showError('email', 'Invalid email format detected');
            return false;
        }
        
        this.clearError('email');
        return true;
    }
    
    validatePassword() {
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showError('password', 'Security key required for access');
            return false;
        }
        
        if (password.length < 6) {
            this.showError('password', 'Security key must be at least 6 characters');
            return false;
        }
        
        this.clearError('password');
        return true;
    }
    
    showError(field, message) {
        const smartField = document.getElementById(field).closest('.smart-field');
        const errorElement = document.getElementById(`${field}Error`);
        
        smartField.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
    
    clearError(field) {
        const smartField = document.getElementById(field).closest('.smart-field');
        const errorElement = document.getElementById(`${field}Error`);
        
        smartField.classList.remove('error');
        errorElement.classList.remove('show');
        setTimeout(() => {
            errorElement.textContent = '';
        }, 200);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            return;
        }
        
        this.setLoading(true);
        
        try {
            // Simulate AI authentication processing
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            // Show neural success
            this.showNeuralSuccess();
        } catch (error) {
            this.showError('password', 'Neural connection failed. Please retry.');
        } finally {
            this.setLoading(false);
        }
    }
    
    async handleSocialLogin(provider, button) {
        console.log(`Initializing ${provider} connection...`);
        
        // AI-enhanced loading state
        const originalHTML = button.innerHTML;
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.7';
        
        const loadingHTML = `
            <div class="social-bg"></div>
            <div style="display: flex; gap: 2px;">
                <div style="width: 3px; height: 12px; background: currentColor; border-radius: 1px; animation: neuralSpinner 1.2s ease-in-out infinite;"></div>
                <div style="width: 3px; height: 12px; background: currentColor; border-radius: 1px; animation: neuralSpinner 1.2s ease-in-out infinite; animation-delay: 0.1s;"></div>
                <div style="width: 3px; height: 12px; background: currentColor; border-radius: 1px; animation: neuralSpinner 1.2s ease-in-out infinite; animation-delay: 0.2s;"></div>
            </div>
            <span>Connecting...</span>
            <div class="social-glow"></div>
        `;
        
        button.innerHTML = loadingHTML;
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log(`Redirecting to ${provider} neural interface...`);
            // window.location.href = `/auth/${provider.toLowerCase().replace(' ', '-')}`;
        } catch (error) {
            console.error(`${provider} connection failed: ${error.message}`);
        } finally {
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
            button.innerHTML = originalHTML;
        }
    }
    
    setLoading(loading) {
        this.submitButton.classList.toggle('loading', loading);
        this.submitButton.disabled = loading;
        
        // Disable social buttons during neural processing
        this.socialButtons.forEach(button => {
            button.style.pointerEvents = loading ? 'none' : 'auto';
            button.style.opacity = loading ? '0.5' : '1';
        });
    }
    
    showNeuralSuccess() {
        // Hide form with neural transition
        this.form.style.transform = 'scale(0.95)';
        this.form.style.opacity = '0';
        
        setTimeout(() => {
            this.form.style.display = 'none';
            document.querySelector('.neural-social').style.display = 'none';
            document.querySelector('.signup-section').style.display = 'none';
            document.querySelector('.auth-separator').style.display = 'none';
            
            // Show neural success
            this.successMessage.classList.add('show');
            
        }, 300);
        
        // Redirect after neural connection established
        setTimeout(() => {
            console.log('Neural link established - accessing AI workspace...');
            // window.location.href = '/ai-dashboard';
        }, 3200);
    }
}

// Initialize the neural form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIAssistantLoginForm();
});