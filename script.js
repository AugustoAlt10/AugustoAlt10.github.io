const profileConfig = {
  name: 'AUGUSTO OLIVEIRA',
  role: 'Criador de Conteúdo, Dev & Gamer',
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

document.title = `${profileConfig.name} | Creator page`;
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

document.querySelectorAll('[data-link]').forEach((link) => {
  const key = link.dataset.link;
  if (key && profileConfig.links[key]) link.href = profileConfig.links[key];
});