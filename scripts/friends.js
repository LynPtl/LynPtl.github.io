hexo.extend.tag.register('friends', function (args) {
  const links = hexo.locals.get('data').links;
  if (!links) return '';

  let result = '<div class="friends-grid">';

  links.forEach(link => {
    result += `
      <div class="friend-card">
        <a href="${link.url}" target="_blank" rel="noopener">
          <div class="friend-avatar">
            <img src="${link.avatar}" alt="${link.name}" onerror="this.src='https://ui-avatars.com/api/?name=${link.name}&background=random'">
          </div>
          <div class="friend-info">
            <div class="friend-name">${link.name}</div>
            <div class="friend-desc">${link.desc}</div>
          </div>
        </a>
      </div>
    `;
  });

  result += '</div>';
  return result;
});
