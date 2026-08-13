const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');

toggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(isOpen));
});

nav?.addEventListener('click', (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }
});

const requirementForm = document.querySelector('.requirement-form');
const formMessage = document.getElementById('form-message');

requirementForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Clear previous messages
  formMessage.textContent = '';
  formMessage.className = 'form-message';

  // Validate form
  if (!requirementForm.checkValidity()) {
    requirementForm.reportValidity();
    return;
  }

  // Show loading state
  const submitButton = requirementForm.querySelector('.send-button');
  const originalButtonText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="send-icon" aria-hidden="true"></span> Sending...';

  try {
    const formData = new FormData(requirementForm);

    // Submit to Formspree
    const response = await fetch(requirementForm.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      // Show success message
      formMessage.textContent = 'Your requirement has been sent successfully! We will get back to you within one working day.';
      formMessage.className = 'form-message success';
      requirementForm.reset();
    } else {
      throw new Error(result.error || 'Form submission failed');
    }
  } catch (error) {
    // Show error message
    formMessage.textContent = 'Sorry, there was an error sending your message. Please try again later or contact us directly via WhatsApp or email.';
    formMessage.className = 'form-message error';
    console.error('Form submission error:', error);
  } finally {
    // Reset button state
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
});
