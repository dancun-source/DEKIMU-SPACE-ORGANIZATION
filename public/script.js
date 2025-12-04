// Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navLinks) navLinks.classList.remove('active');
        if (hamburger) hamburger.classList.remove('active');
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// FAQ Accordion
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const isActive = item.classList.contains('active');

        // Close all other items
        document.querySelectorAll('.accordion-item').forEach(accItem => {
            accItem.classList.remove('active');
            accItem.querySelector('.accordion-body').style.maxHeight = null;
        });

        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
            const body = item.querySelector('.accordion-body');
            body.style.maxHeight = body.scrollHeight + 'px';
        }
    });
});

// Scroll Animations (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Account for fixed header
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    });
});

// Team Data Fetching
document.addEventListener("DOMContentLoaded", function () {
    fetch('team.json')
        .then(response => response.json())
        .then(data => {
            const teamContainer = document.getElementById('teamContainer');
            if (teamContainer) {
                teamContainer.innerHTML = data.map(member => `
                    <div class="instructor-card" data-aos="fade-up">
                        <img src="${member.image}" alt="${member.role} - ${member.name}" class="instructor-img">
                        <div class="instructor-info">
                            <h3>${member.name}</h3>
                            <p>${member.role}</p>
                            <div class="instructor-bio">${member.bio}</div>
                            <div style="margin-top: 10px; font-size: 0.85rem; color: #777;">
                                <i class="fas fa-envelope" style="color: var(--secondary-color); margin-right: 5px;"></i> ${member.email}
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        })
        .catch(error => console.error('Error loading team data:', error));

    // Payment Modal Logic
    const modal = document.getElementById('paymentModal');
    const closeBtn = document.querySelector('.close-modal');
    const enrollBtns = document.querySelectorAll('.enroll-btn');
    const modalCourseName = document.getElementById('modalCourseName');
    const modalAmount = document.getElementById('modalAmount');
    const paymentForm = document.getElementById('paymentForm');
    const paymentStatus = document.getElementById('paymentStatus');

    let currentCourseId = null;

    // Open Modal
    if (enrollBtns) {
        enrollBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const courseId = btn.getAttribute('data-course-id');
                const amount = btn.getAttribute('data-amount');

                // Find the course name safely
                // Updated selector to match new card structure
                const courseCard = btn.closest('.course-card') || btn.closest('.course-content');
                const courseName = courseCard ? courseCard.querySelector('h3').textContent : 'Course';

                if (modalCourseName) modalCourseName.textContent = courseName;
                if (modalAmount) modalAmount.textContent = amount;

                currentCourseId = courseId;

                if (modal) {
                    modal.style.display = 'flex'; // Changed to flex for centering
                    // Add animation class if needed
                }
            });
        });
    }

    // Close Modal
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (modal && e.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Handle Payment Submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phoneNumber = document.getElementById('phoneNumber').value;
            const payBtn = document.getElementById('payBtn');

            // Basic Validation
            if (!phoneNumber.match(/^(07|01)[0-9]{8}$/)) {
                if (paymentStatus) {
                    paymentStatus.textContent = 'Please enter a valid Safaricom number (e.g., 0712345678)';
                    paymentStatus.className = 'payment-status status-error';
                    paymentStatus.style.display = 'block';
                }
                return;
            }

            // Loading State
            if (payBtn) {
                payBtn.disabled = true;
                payBtn.textContent = 'Processing...';
            }
            if (paymentStatus) {
                paymentStatus.textContent = 'Initiating STK Push... Check your phone.';
                paymentStatus.className = 'payment-status status-loading';
                paymentStatus.style.display = 'block';
            }

            try {
                // Get token
                const user = JSON.parse(localStorage.getItem('user'));
                const token = user ? user.token : null;

                if (!token) {
                    if (paymentStatus) {
                        paymentStatus.textContent = 'Please login to enroll.';
                        paymentStatus.className = 'payment-status status-error';
                    }
                    if (payBtn) {
                        payBtn.disabled = false;
                        payBtn.textContent = 'Pay Now';
                    }
                    setTimeout(() => window.location.href = 'login.html', 2000);
                    return;
                }

                if (!currentCourseId) {
                    throw new Error("No course selected.");
                }

                // Construct the payload
                const payload = {
                    courseId: currentCourseId,
                    phoneNumber: phoneNumber
                };

                console.log('Sending payment request:', payload);

                const response = await fetch('/api/payment/stk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Payment initiation failed');
                }

                // Success
                if (paymentStatus) {
                    paymentStatus.innerHTML = 'STK Push Sent! <br> Please enter your PIN on your phone to complete the transaction.';
                    paymentStatus.className = 'payment-status status-success';
                }

                // Reset after a few seconds
                setTimeout(() => {
                    if (modal) modal.style.display = 'none';
                    if (payBtn) {
                        payBtn.disabled = false;
                        payBtn.textContent = 'Pay Now';
                    }
                    paymentForm.reset();
                    if (paymentStatus) paymentStatus.style.display = 'none';
                }, 5000);

            } catch (error) {
                console.error('Payment Error:', error);
                if (paymentStatus) {
                    let errorMsg = 'Failed to initiate payment. ';
                    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                        errorMsg += 'Please check your internet connection and try again.';
                    } else {
                        errorMsg += error.message || 'Please try again.';
                    }
                    paymentStatus.textContent = errorMsg;
                    paymentStatus.className = 'payment-status status-error';
                }
                if (payBtn) {
                    payBtn.disabled = false;
                    payBtn.textContent = 'Pay Now';
                }
            }
        });
    }
});
