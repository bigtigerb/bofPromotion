// DOM 加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 立即添加页面加载类，防止FOUC
    document.body.classList.add('page-loading');
    
    // 预处理动画元素
    preloadAnimationElements();
    
    // 初始化所有功能
    initScrollAnimations();
    initSmoothScroll();
    initNavbarScroll();
    initInteractiveElements();
    initTypingEffect();
    initParallaxEffect();
    initMobileMenu();
    
    // 页面加载完成后移除加载状态
    window.addEventListener('load', function() {
        document.body.classList.remove('page-loading');
        document.body.classList.add('page-loaded');
    });
});

// 预处理动画元素
function preloadAnimationElements() {
    const animatedElements = document.querySelectorAll(`
        .overview-item,
        .feature-card,
        .tech-item,
        .highlight-card,
        .section-title,
        .category-title
    `);

    // 为所有元素添加基础变换和GPU加速
    animatedElements.forEach((el, index) => {
        // 添加初始状态
        el.style.opacity = '0';
        el.style.transform = 'translate3d(0, 30px, 0)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.willChange = 'transform, opacity';
        
        // 添加GPU加速类
        el.classList.add('gpu-accelerated');
        
        // 检查是否在视口内（首屏元素）
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            // 首屏元素立即显示，避免闪烁
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translate3d(0, 0, 0)';
            }, index * 50);
        }
    });
}

// 滚动动画
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(`
        .overview-item,
        .feature-card,
        .tech-item,
        .highlight-card,
        .section-title,
        .category-title
    `);

    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 检查元素是否已经被预加载显示了
                const currentOpacity = parseFloat(window.getComputedStyle(entry.target).opacity);
                
                if (currentOpacity < 0.5) { // 只对未显示的元素执行动画
                    // 为卡片组添加错开延迟效果
                    if (entry.target.classList.contains('feature-card') || 
                        entry.target.classList.contains('overview-item') ||
                        entry.target.classList.contains('tech-item') ||
                        entry.target.classList.contains('highlight-card')) {
                        
                        const cards = entry.target.parentElement.children;
                        const index = Array.from(cards).indexOf(entry.target);
                        
                        // 使用requestAnimationFrame + setTimeout组合
                        requestAnimationFrame(() => {
                            setTimeout(() => {
                                entry.target.style.opacity = '1';
                                entry.target.style.transform = 'translate3d(0, 0, 0)';
                            }, index * 100);
                        });
                    } else {
                        // 标题类元素立即显示
                        requestAnimationFrame(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translate3d(0, 0, 0)';
                        });
                    }
                }
                
                // 只触发一次后停止观察
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 只观察尚未显示的元素
    animatedElements.forEach(el => {
        const currentOpacity = parseFloat(window.getComputedStyle(el).opacity);
        if (currentOpacity < 0.5) {
            observer.observe(el);
        }
    });
}

// 平滑滚动
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 导航栏滚动效果
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let ticking = false;

    function updateNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 只改变背景透明度，不隐藏导航栏
        if (scrollTop > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick, { passive: true });
}

// 交互元素效果
function initInteractiveElements() {
    // 按钮点击效果
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 创建波纹效果
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            // 模拟功能
            if (this.textContent.includes('立即体验') || this.textContent.includes('免费试用')) {
                showNotification('演示功能：这里可以跳转到系统登录页面', 'info');
            } else if (this.textContent.includes('查看演示') || this.textContent.includes('联系我们')) {
                showNotification('演示功能：这里可以展示产品演示或联系方式', 'info');
            }
        });
    });

    // 为卡片添加GPU加速类
    const cards = document.querySelectorAll('.feature-card, .overview-item, .tech-item, .highlight-card');
    cards.forEach(card => {
        card.classList.add('gpu-accelerated');
    });
}

// 打字机效果
function initTypingEffect() {
    const heroTitle = document.querySelector('.hero-title');
    const originalText = heroTitle.textContent;
    heroTitle.textContent = '';
    
    let index = 0;
    const typeWriter = () => {
        if (index < originalText.length) {
            heroTitle.textContent += originalText.charAt(index);
            index++;
            setTimeout(typeWriter, 100);
        }
    };
    
    // 延迟开始打字效果
    setTimeout(typeWriter, 500);
}

// 视差滚动效果
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    const parallax = hero.querySelector('.hero-container');
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        
        if (parallax && scrolled < window.innerHeight) {
            parallax.style.transform = `translate3d(0, ${scrolled * 0.1}px, 0)`;
        }
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick, { passive: true });
}

// 通知功能
function showNotification(message, type = 'info') {
    // 移除已存在的通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'info' ? 'ℹ️' : '✅'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">×</button>
        </div>
    `;
    
    // 添加样式
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        padding: 16px;
        gap: 12px;
    `;
    
    const message_el = notification.querySelector('.notification-message');
    message_el.style.cssText = `
        flex: 1;
        font-size: 14px;
        color: #333;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(notification);
    
    // 关闭按钮功能
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    });
    
    // 自动关闭
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// 添加动态CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .ripple {
        position: absolute;
        background: rgba(255,255,255,0.6);
        border-radius: 50%;
        pointer-events: none;
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(1);
            opacity: 0;
        }
    }
    
    .btn {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// 页面加载完成后的额外效果
window.addEventListener('load', function() {
    // 添加加载完成的类
    document.body.classList.add('loaded');
    
    // 数字计数动画（如果需要的话）
    animateNumbers();
});

// 数字动画效果
function animateNumbers() {
    const numberElements = document.querySelectorAll('[data-number]');
    
    numberElements.forEach(element => {
        const targetNumber = parseInt(element.getAttribute('data-number'));
        const duration = 2000; // 动画持续时间
        const steps = 60; // 动画步数
        const stepValue = targetNumber / steps;
        const stepDuration = duration / steps;
        
        let currentNumber = 0;
        let step = 0;
        
        const timer = setInterval(() => {
            step++;
            currentNumber = Math.min(currentNumber + stepValue, targetNumber);
            element.textContent = Math.floor(currentNumber);
            
            if (step >= steps) {
                clearInterval(timer);
                element.textContent = targetNumber;
            }
        }, stepDuration);
    });
}

// 移动端菜单功能（为了响应式体验）
function initMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('nav-menu-active');
            this.classList.toggle('nav-toggle-active');
        });
    }
    
    // 点击菜单项时关闭移动端菜单
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('nav-menu-active');
            if (navToggle) {
                navToggle.classList.remove('nav-toggle-active');
            }
        });
    });
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

