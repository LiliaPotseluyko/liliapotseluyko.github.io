function foldAllDropdowns() {
  document.querySelectorAll('.dropdown.open').forEach(drop => drop.classList.remove('open'));
}

function toggleDescription(el) {
  el.classList.toggle('active');
}

function createDropdown(category, skills) {
  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown';
  dropdown.innerHTML = `
    <button class="dropdown-btn">${category} ▾</button>
    <div class="dropdown-content">
      ${skills.map(skill => `
        <div class="skill-item" onclick="toggleDescription(this)">
          ${skill.name}
          <div class="skill-description">${skill.description}</div>
        </div>
      `).join('')}
    </div>
  `;
  dropdown.querySelector('.dropdown-btn').addEventListener('click', () => {
    dropdown.classList.toggle('open');
  });
  return dropdown;
}

function createEducationDropdown(level, institutions) {
  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown';
  dropdown.innerHTML = `
    <button class="dropdown-btn">${level} ▾</button>
    <div class="dropdown-content">
      ${institutions.map(inst => `
        <div class="skill-item" onclick="toggleDescription(this)">
          ${inst.name}
          <div class="skill-description">${inst.description}</div>
        </div>
      `).join('')}
    </div>
  `;
  dropdown.querySelector('.dropdown-btn').addEventListener('click', () => {
    dropdown.classList.toggle('open');
  });
  return dropdown;
}

fetch('skills.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('skillsContainer');
    const header = document.createElement('h1');
    header.textContent = 'Skills';
    container.appendChild(header);
    data.forEach(category => {
      const dropdown = createDropdown(category.category, category.skills);
      container.appendChild(dropdown);
    });
  });

fetch('education.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('educationContainer');
    const header = document.createElement('h1');
    header.textContent = 'Education';
    container.appendChild(header);
    data.forEach(level => {
      const dropdown = createEducationDropdown(level.level, level.institutions);
      container.appendChild(dropdown);
    });
  });

