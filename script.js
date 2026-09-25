const profileConfig = {
  name: 'AUGUSTO OLIVEIRA',
  avatar: '598807799_2631767033849203_692147827125972732_n.webp',
  audience: {
    youtubeSubscribers: 11800,
    tiktokFollowers: 50400
  },
  socialLinks: {
    instagram: 'https://www.instagram.com/augustoo_altt/',
    tiktok: 'https://www.tiktok.com/@augustoalt10',
    youtube: 'https://www.youtube.com/@AugustoAlt10'
  },
  links: {
    roblox: 'https://www.roblox.com/',
    instagram: 'https://www.instagram.com/augustoo_altt/',
    youtube: 'https://www.youtube.com/@AugustoAlt10',
    tiktok: 'https://www.tiktok.com/@augustoalt10',
    discord: 'https://discord.gg/Pbs59T8HF9',
    email: 'mailto:augustoaltcontato@gmail.com'
  }
};

document.title = `${profileConfig.name} | Criador de Conteúdo e Desenvolvedor`;
const profileImage = document.querySelector('#profile-image');
if (profileImage) profileImage.src = profileConfig.avatar;

const followersTotal = document.querySelector('#followers-total');
if (followersTotal) {
  const total = profileConfig.audience.youtubeSubscribers + profileConfig.audience.tiktokFollowers;
  followersTotal.querySelector('strong').textContent = `${(total / 1000).toFixed(1).replace('.', ',')}k`;
}

document.querySelectorAll('[data-social]').forEach((social) => {
  const key = social.dataset.social;
  if (key && profileConfig.socialLinks[key]) social.href = profileConfig.socialLinks[key];
});

document.querySelectorAll('a[data-link]').forEach((link) => {
  const key = link.dataset.link;
  if (key && profileConfig.links[key]) link.href = profileConfig.links[key];
});

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {}
  }

  const temporaryInput = document.createElement('textarea');
  temporaryInput.value = text;
  temporaryInput.setAttribute('readonly', '');
  temporaryInput.style.cssText = 'position:fixed;opacity:0;user-select:text;-webkit-user-select:text;';
  document.body.append(temporaryInput);
  temporaryInput.select();
  const copied = document.execCommand('copy');
  temporaryInput.remove();
  if (!copied) throw new Error('Não foi possível copiar o texto.');
}

const emailCopyButton = document.querySelector('[data-copy-email]');
if (emailCopyButton) {
  const email = profileConfig.links.email.replace(/^mailto:/, '');
  const emailFeedback = emailCopyButton.querySelector('[data-copy-feedback]');
  let feedbackTimeout;

  emailCopyButton.addEventListener('click', async () => {
    clearTimeout(feedbackTimeout);
    try {
      await copyText(email);
      emailFeedback.textContent = 'E-mail copiado!';
    } catch {
      emailFeedback.textContent = 'Não foi possível copiar';
    }
    feedbackTimeout = setTimeout(() => {
      emailFeedback.textContent = email;
    }, 2200);
  });
}