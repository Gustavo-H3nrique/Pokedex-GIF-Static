const typeColors = {
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
    normal: '#A8A77A'
};

const pokemonName = document.querySelector('.pokemon_name');
const pokemonNumber = document.querySelector('.pokemon_number');
const pokemonImage = document.querySelector('.pokemon_image');
const pokemonTypesContainer = document.querySelector('.pokemon_types');

const pokemonability = document.querySelector('.pokemon_ability');
const li = document.createElement('li');

const form = document.querySelector('.form');
const input = document.querySelector('.input_search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');

let pokemonAudio = new Audio();
let searchPokemon = 1;
let imageSwitchTimeout = null;


const bgMusic = document.getElementById('bgMusic');
      bgMusic.volume = 0.3;
      bgMusic.loop = true;

const buttonMusic = document.getElementById('btnMusic');
      // Estado inicial: música pausada
      if (buttonMusic) {
          buttonMusic.textContent = '🎵';
        }

      function toggleMusic() {
          if (bgMusic.paused) {
              bgMusic.play().catch(error => {
                  console.log('Erro ao tocar música:', error);
              });
              if (buttonMusic) {
                buttonMusic.textContent = '⏸️';
            }
        } else {
            bgMusic.pause();
            if (buttonMusic) {
                buttonMusic.textContent = '🎵';
            }
        }
    }
    
    // Adiciona o event listener ao botão de música
    if (buttonMusic) {
        buttonMusic.addEventListener('click', toggleMusic);
    }
            


const fetchPokemon = async (pokemon) => {

    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    
    if (APIResponse.status === 200) {
    const data = await APIResponse.json();
    if (data.cries) {
        if (data.cries.latest) {
            pokemonAudio.src = data.cries.latest;
        } else if (data.cries.legacy) {
            pokemonAudio.src = data.cries.legacy;
        }
    }
    return data;
    }
}

const renderPokemon = async (pokemon) => {

    pokemonName.innerHTML = 'Loading...';
    pokemonNumber.innerHTML = '';

    const data = await fetchPokemon(pokemon);

    if (data) {
        if (imageSwitchTimeout) {
            clearTimeout(imageSwitchTimeout);
            imageSwitchTimeout = null;
        }

     pokemonImage.style.display = 'block';
     pokemonName.innerHTML = data.name;
     pokemonNumber.innerHTML = data.id;
     pokemonTypesContainer.innerHTML = '';
     // 1. Primeiro, limpe a lista de habilidades anterior
     pokemonability.innerHTML = '';

     data.types.forEach((typeEntry) => {
      const typeName = typeEntry.type.name;
      const typeSpan = document.createElement('span');
      
      typeSpan.classList.add('type-span');
      typeSpan.classList.add(typeName); // Adiciona a classe da cor (ex: .fire)
      typeSpan.innerText = typeName;
      
      pokemonTypesContainer.appendChild(typeSpan);
    });
     
    const pokemonType = data.types[0].type.name;
    const themeColor = typeColors[pokemonType] || '#3a444d'; // Cor padrão caso não encontre

     for (let i = 0; i < 3; i++) {
    const li = document.createElement('li');
    // Se a API trouxe uma habilidade para essa posição, coloca o nome, se não, deixa vazio
    if (data.abilities[i]) {
        const abilityData = data.abilities[i].ability;
        li.textContent = abilityData.name;
        li.style.backgroundColor = themeColor;
        li.style.border = `2px solid ${themeColor}`;

        const translateText = async (text) => {
    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt-br`);
        const data = await res.json();
        return data.responseData.translatedText;
    } catch (error) {
        return text; // Se falhar a tradução, devolve o original
    }
};

        // Criamos o elemento do balão (tooltip)
        const tooltip = document.createElement('span');
        tooltip.classList.add('ability-tooltip');
        tooltip.textContent = 'A traduzir...'; // Texto temporário
        li.appendChild(tooltip);

        // Ao passar o mouse, buscamos a descrição na URL da habilidade
        li.addEventListener('mouseenter', async () => {
            if (tooltip.textContent === 'A traduzir...') {
            const response = await fetch(abilityData.url);
            const abilityInfo = await response.json();
            const enEntry = abilityInfo.effect_entries.find(e => e.language.name === 'en');
            
            if (enEntry) {
                    const translated = await translateText(enEntry.short_effect);
                    tooltip.textContent = translated;
                } else {
                    tooltip.textContent = "Descrição não disponível.";
                }
            }
        });

    } else {
        // Se não existir a 2ª ou 3ª habilidade, escondemos o ponto
        li.style.visibility = 'hidden'; 
    }
    pokemonability.appendChild(li);
}
    
const officialArt = data.sprites?.other?.['official-artwork']?.front_default;
const animatedSprite = data.sprites?.versions?.['generation-v']?.['black-white']?.animated?.front_default;

if (animatedSprite) {
    pokemonImage.style.opacity = '1';
    pokemonImage.style.transition = '';
    pokemonImage.src = animatedSprite;
    if (officialArt) {
        imageSwitchTimeout = setTimeout(() => {
            pokemonImage.style.transition = 'opacity 0.01s ease';
            pokemonImage.style.opacity = '0';
            const onFadeOut = () => {
                pokemonImage.removeEventListener('transitionend', onFadeOut);
                pokemonImage.src = officialArt;
                imageSwitchTimeout = null;
                pokemonImage.onload = function () {
                    pokemonImage.style.opacity = '1';
                    pokemonImage.onload = null;
                };
            };
            pokemonImage.addEventListener('transitionend', onFadeOut);
        }, 6500);
    }
} else if (officialArt) {
    pokemonImage.src = officialArt;
} else {
    pokemonImage.src = data.sprites?.front_default || '';
}
searchPokemon = data.id;

     searchPokemon = data.id;
    } else {
        pokemonImage.style.display = 'none';
        pokemonName.innerHTML = 'Not Found :c';
        pokemonNumber.innerHTML = '';
    }
}

form .addEventListener('submit', (event) => {
    event.preventDefault();
    console.log(input.value);

    renderPokemon(input.value.toLowerCase());
    input.value = '';

});

buttonPrev .addEventListener('click', () => {
    if (searchPokemon > 1) {
    searchPokemon -= 1;
    renderPokemon(searchPokemon);
 }

});

buttonNext .addEventListener('click', () => {
    if (searchPokemon < 649) {
    searchPokemon += 1;
    renderPokemon(searchPokemon);
    }

});

renderPokemon(searchPokemon);

const buttonCry = document.querySelector('.btn-cry');

buttonCry.addEventListener('click', () => {
    // Toca o som que foi carregado no fetchPokemon
    pokemonAudio.play();
});

