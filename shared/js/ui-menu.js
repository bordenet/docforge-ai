/**
 * UI Utilities - Action Menu Component
 * Creates accessible dropdown/overflow menus with ARIA support
 * @module ui-menu
 */

// Track active action menu for cleanup
let activeActionMenu = null;

/**
 * Create an action menu (overflow menu) with ARIA accessibility
 * @param {Object} options - Menu configuration
 * @param {HTMLElement} options.triggerElement - The button that triggers the menu
 * @param {Array} options.items - Menu items [{label, icon, onClick, separator, destructive, disabled}]
 * @param {string} [options.position='bottom-end'] - Menu position relative to trigger
 * @returns {Object} - Menu controller with open(), close(), toggle() methods
 */
export function createActionMenu({ triggerElement, items, position: _position = 'bottom-end' }) {
  const menuId = `action-menu-${Date.now()}`;
  let isOpen = false;
  let menu = null;

  // Controller object - declared early so inner functions can reference it
  let controller = null;

  // Set ARIA attributes on trigger
  triggerElement.setAttribute('aria-haspopup', 'menu');
  triggerElement.setAttribute('aria-expanded', 'false');
  triggerElement.setAttribute('aria-controls', menuId);

  function createMenuElement() {
    menu = document.createElement('div');
    menu.id = menuId;
    menu.className = 'action-menu bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]';
    menu.setAttribute('role', 'menu');
    menu.tabIndex = -1;

    menu.innerHTML = items.map((item, index) => {
      if (item.separator) {
        return '<div class="border-t border-gray-200 dark:border-gray-700 my-1" role="separator"></div>';
      }
      const disabledClass = item.disabled ? 'opacity-50 cursor-not-allowed' : '';
      const destructiveClass = item.destructive ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300';
      return `
        <button
          class="action-menu-item w-full px-4 py-2 text-left flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 ${disabledClass} ${destructiveClass}"
          role="menuitem"
          data-index="${index}"
          ${item.disabled ? 'disabled' : ''}
          tabindex="-1"
        >
          ${item.icon ? `<span class="mr-2">${item.icon}</span>` : ''}
          <span>${item.label}</span>
        </button>
      `;
    }).join('');

    return menu;
  }

  function positionMenu() {
    if (!menu) return;
    const triggerRect = triggerElement.getBoundingClientRect();

    // Position below trigger, aligned to right edge
    menu.style.position = 'fixed';
    menu.style.top = `${triggerRect.bottom + 4}px`;
    menu.style.left = `${triggerRect.right - menu.offsetWidth}px`;
    menu.style.zIndex = '50';
  }

  function handleClick(e) {
    const button = e.target.closest('[role="menuitem"]');
    if (button && !button.disabled) {
      const index = parseInt(button.dataset.index);
      const item = items[index];
      if (item && item.onClick) {
        close();
        item.onClick();
      }
    }
  }

  function handleOutsideClick(e) {
    if (menu && !menu.contains(e.target) && !triggerElement.contains(e.target)) {
      close();
    }
  }

  function open() {
    if (isOpen) return;

    // Close any other open menu
    if (activeActionMenu && activeActionMenu !== controller) {
      activeActionMenu.close();
    }

    menu = createMenuElement();
    document.body.appendChild(menu);
    positionMenu();

    // Trigger animation by adding open class after a frame
    requestAnimationFrame(() => {
      menu.classList.add('action-menu-open');
    });

    isOpen = true;
    activeActionMenu = controller;
    triggerElement.setAttribute('aria-expanded', 'true');

    // Event listeners
    menu.addEventListener('click', handleClick);
    document.addEventListener('click', handleOutsideClick, true);
  }

  function close() {
    if (!isOpen || !menu) return;

    // Animate out
    menu.classList.remove('action-menu-open');
    menu.classList.add('action-menu-closing');

    // Remove after animation
    const menuToRemove = menu;
    setTimeout(() => {
      if (menuToRemove.parentNode) {
        menuToRemove.parentNode.removeChild(menuToRemove);
      }
    }, 150);

    menu = null;
    isOpen = false;
    if (activeActionMenu === controller) {
      activeActionMenu = null;
    }
    triggerElement.setAttribute('aria-expanded', 'false');

    document.removeEventListener('click', handleOutsideClick, true);
  }

  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  // Trigger click handler
  triggerElement.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  controller = { open, close, toggle, isOpen: () => isOpen };
  return controller;
}

