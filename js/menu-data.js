/* Menu + privacy CONTENT (English, exactly as provided). Kept apart from the components (js/modals.js) so translations can be added later:
   to translate, add the same structure under another language key and read it in modals.js with the current language.
   Menu item = [name, [labels…], description]. */
window.BK_MENU = {
  ar: {
    city: 'Buenos Aires, Argentina',
    cocktails: {
      title: 'If any object can become art, any flavor can tell a story.',
      side: '50+ whiskies behind the bar',
      groups: [
        { title: 'Delicate', desc: 'Fresh, elegant and on the lighter side.', items: [
          ['Cero', ['Minimalism'], 'Tito’s Vodka, coconut, grapefruit.'],
          ['Forma', ['Bauhaus'], 'Beefeater 24, dry vermouth, genmaicha, sparkling water.'],
          ['Instante', ['Impressionism'], 'Lavender gin, spirulina, jasmine, sparkling water.'],
          ['Pera', ['Art Nouveau'], 'Cristallino Eau de Vie, banana, lemon verbena.'] ] },
        { title: 'Aromatic', desc: 'More aroma and texture, still in balance.', items: [
          ['Deseo', ['Post-Impressionism'], 'Pisco 1615 Quebranta, maracumango, verjus, Mumm Extra Brut.'],
          ['Renacer', ['Renaissance'], 'Beefeater London Dry Gin, Lillet Rosé, extra dry vermouth, oloroso sherry, jasmine.'],
          ['Venus', ['Rococo'], 'Beefeater London Dry Gin, passionaria, Apricot Brandy, cacao nibs, vanilla, bubbles.'] ] },
        { title: 'Vibrant', desc: 'More tension, more fruit, more energy.', items: [
          ['Ensamble', ['Cubism'], 'Bulldog Gin, Chardonnay, Lillet Blanc, dry vermouth, lemon.'],
          ['Náufrago', ['Romanticism'], 'Dark rum, house-made black fig liqueur, acidified black tea.'],
          ['Tinto de fondo', ['Viajero'], 'Animal Malbec, Amaro Averna, Absolut Vodka, hibiscus, rosehip.'],
          ['Viajero', ['Pop Art'], 'Fernet Branca, Absolut Vodka, house-made herb soda.'] ] },
        { title: 'Spiced', desc: 'Herbs, tea and spices that add layers.', items: [
          ['Breakfast Punch', ['Povera'], 'Pisco 1615, toasted bread, yogurt, apple.'],
          ['Impulso', ['Futurism'], 'Absolut Vodka, hierroquina, ginger, Sichuan pepper, tonic water.'],
          ['La Obra', ['Surrealism'], 'Grappa Candolini, chrysanthemum, coconut, absinthe.'] ] },
        { title: 'Rich', desc: 'More structure, toasted notes and long finishes.', items: [
          ['Baco', ['Baroque'], 'Jim Beam Bourbon, Cognac Hennessy VS, hippocras, quinoa aloja.'],
          ['Boogie', ['De Stijl'], 'Jameson Irish Whiskey, Cynar, Sauvignon Blanc.'],
          ['Sauvage', ['Fauvism'], 'El Jimador Tequila Silver, herbs, roasted carrots, sunflower seeds.'] ] },
        { title: 'Bold', desc: 'Big flavors to finish the journey.', items: [
          ['Barbican', ['Brutalism'], 'Chivas Regal 12, fortified wine blend, pine mushrooms, butter.'],
          ['Chief', ['Abstract Expressionism'], 'Bourbon, red berries, cold brew, cacao.'],
          ['El Grito', ['Expressionism'], 'El Jimador Tequila Silver, aquavit, roasted beetroot, bitter cacao, coffee.'] ] }
      ],
      credits: { lead: 'Bar director:', director: ['Sergio Ancarola'], authorsLead: 'Cocktail authors:', authors: ['Luciano Cardozo', 'Nicolas Grammatico', 'Bruno Donato', 'Karen Alarcon', 'Sergio Antonaccio', 'Diego Palencia', 'Javier Rios'] }
    },
    kitchen: {
      groups: [
        { title: 'Small plates', items: [
          ['Sopa de Nana', ['Vegan'], 'Borscht, traditional Ukrainian soup made with beetroot, cabbage, potatoes and bell pepper. Optionally with ossobuco.'],
          ['Hummus toast', ['Vegan'], 'Chickpea hummus, cured red onion, crunchy peanuts, sourdough bread.'],
          ['Thai prawns', ['Spicy'], 'Prawns marinated in garlic, ginger, hondashi and sriracha, with smashed baby potatoes in green curry sauce.'],
          ['Oyster mushroom tostadas', ['Vegan'], 'Oyster mushrooms marinated in lemon and ginger, with pickled red onion, avocado and cashew cream on purple corn tostadas.'],
          ['Crispy BBQ chicken', [], 'Crispy chicken thigh bites, breaded and fried, with house BBQ sauce.'],
          ['Kimchi & mac ’n cheese poppers', [], 'Kimchi croquettes with béchamel, and noodle fritters with cheddar and bacon.'],
          ['Fried portobellos', ['Vegetarian'], 'Portobellos breaded in sourdough crumbs, with citrus aioli, lemon.'],
          ['Rustic smashed potatoes', [], 'Twice-cooked smashed potatoes, three-cheese sauce, crispy bacon and chives.'],
          ['Papas bravas', ['Vegetarian', 'Spicy'], 'Twice-cooked smashed potatoes, gochujang tomato sauce.'] ] },
        { title: 'Mains', items: [
          ['Ensalada Mango No. 5', ['Vegetarian'], 'Salad of tropical mango cubes, garden cherry tomatoes, Roquefort cheese, toasted walnuts, sweet potato, bed of greens.'],
          ['Roasted cauliflower', ['Vegan'], 'Pea béchamel with orange almond cream, fried garlic, grated vegan cheese, roasted chestnuts.'],
          ['Braised pork belly', [], 'Pilaf rice, pickled cucumbers, fried shallots, pork cooking juices.'],
          ['Catch of the day', [], 'Grilled catch of the day, peanut sauce, charred cucumbers, strawberry, fried capers.'],
          ['American burger', [], '210 g patty, blend of premium Argentine cuts, barbecue sauce, caramelized onion, cheddar cheese.'],
          ['Pulled chicken sandwich', [], 'Pulled chicken, red pepper muhammara sauce, red lettuce, tomato, grilled onion.'],
          ['Braised pork shoulder sandwich', [], 'Pork shoulder braised for 6 hours, red onion pickle, old-style mustard, arugula, fontina cheese.'],
          ['Tomato milanesa sandwich', [], 'Breaded organic tomato, black olive powder mayonnaise, wild arugula, dambo cheese.'],
          ['Cut of the day', [], 'Ribeye 300 g, fried Andean baby potatoes, roasted cauliflower, pepper sauce.'] ] },
        { title: 'Desserts', items: [
          ['The profiterole', [], 'House-made profiterole, American cream ice cream, red berries.'],
          ['Don Jameson', [], 'American cream ice cream, Jameson whiskey macerated in aromatic spices, house-made crunch in the style of Ferrero Rocher.'] ] }
      ]
    }
  },
  cl: {
    city: 'Santiago, Chile',
    cocktails: {
      title: 'If any object can become art, any flavor can tell a story.',
      side: '130+ whiskies behind the bar',
      groups: [
        { title: 'Delicate', desc: 'Fresh, elegant and on the lighter side.', items: [
          ['Dessau', ['Bauhaus / Constructivism'], 'Absolut Vodka, wine cordial, celery.'],
          ['Gallé', ['Art Nouveau'], 'Hendrick’s, Tio Pepe Jerez Palomino Fino, elderflower, fennel.'],
          ['N/A', ['Minimalism'], 'Sake, white water, saline solution.'],
          ['Rouen', ['Impressionism'], 'Havana Club 3 Year Old, Undurraga Brut, falernum, rice vinegar.'] ] },
        { title: 'Aromatic', desc: 'More aroma and texture, still in balance.', items: [
          ['Arlés', ['Post-Impressionism'], 'Absolut Vodka, passion fruit, peperoncino, citrus mix.'],
          ['Studio', ['Renaissance'], 'Tio Pepe Jerez Palomino Fino, Carpano Bianco, manzanilla, cinnamon.'],
          ['Pompa', ['Rococo / Neoclassicism'], 'Beefeater London Dry Gin, flowers, sparkling water.'] ] },
        { title: 'Vibrant', desc: 'More tension, more fruit, more energy.', items: [
          ['Banana Split', ['Pop Art'], 'Flor de Caña 4, Fernet Branca, banana, vanilla.'],
          ['Ma Jolie', ['Cubism'], 'Alto del Carmen Transparente, dry vermouth, manzanilla, tomato water.'],
          ['Mirage', ['Symbolism'], 'Barceló Ron Añejo, apricot brandy, black tea.'],
          ['Wanderer', ['Romanticism'], 'Pisco Republicano Añejado, Carpano Rosso, maqui, Thomas Henry Watermelon.'] ] },
        { title: 'Spiced', desc: 'Herbs, tea and spices that add layers.', items: [
          ['La Soda', ['Povera'], 'Pisco, Outcider Sidra Seca, toasted rice, apple.'],
          ['Manifiesto', ['Futurism'], 'Hendrick’s Another, Amaro Montenegro, cardamom, chai, sparkling water.'],
          ['René', ['Surrealism'], 'Jameson, beurre noisette, apple verjus, rye bread, anise.'] ] },
        { title: 'Rich', desc: 'More structure, toasted notes and long finishes.', items: [
          ['El Clásico', ['De Stijl'], 'Absolut Vodka, Aperol, Cocchi Americano, dry vermouth.'],
          ['Gozo', ['Baroque'], 'Havana Club Añejo Reserva, Alfonso Jerez Oloroso, plums, allspice cordial.'],
          ['Matisse', ['Fauvism'], 'Mezcal 400 Conejos, Novas Sauvignon Blanc, roasted red peppers, raspberry.'] ] },
        { title: 'Bold', desc: 'Big flavors to finish the journey.', items: [
          ['Action!', ['Abstract Expressionism'], 'Chivas Regal Extra 13 Sherry Cask, Novas Carmenere, chocolate.'],
          ['Caligari', ['Expressionism'], 'Jim Beam Bourbon, coffee, grapefruit, hibiscus.'],
          ['Hábitat', ['Brutalism'], 'Chivas Regal 12, sesame, lapsang souchong.'] ] }
      ],
      credits: { lead: 'Bar director:', director: ['Sergio Ancarola'], authorsLead: 'Cocktail authors:', authors: ['Fernando Contreras', 'Claudia Jorquera', 'Sebastian Nahuelhual'] }
    },
    kitchen: {
      groups: [
        { title: 'Small plates', items: [
          ['Gyozas', ['Spicy'], 'Smoked pork belly, miso, lightly spicy sweet sauce and fresh cucumber.'],
          ['Artichoke tartare', ['Vegan'], 'Artichoke, green apple, red onion, lemon and chives over crispy cassava.'],
          ['Bread & prawn', [], 'Potato brioche, confit prawn, cochayuyo pebre, seaweed ferment, avocado mousse and fresh lemon.'],
          ['Tongue taco', [], 'Smoked and roasted beef tongue, chocolate demi-glace, salsa verde and crispy blue cheese.'],
          ['Arancini', [], 'Butter arancini, seaweed cream, fresh tuna and fresh lemon.'],
          ['Crispy wings', [], 'Crispy chicken, ceviche-style cream and pickled onion.'],
          ['Creamy Mediterranean', ['Vegetarian'], 'Artichoke cream, tomato, Parmesan, cream cheese, on toast, avocado and citrus mousse.'],
          ['Ceviche', [], 'Fresh salmon, smoked ají amarillo tiger’s milk, cilantro and crispy potato.'],
          ['Octopus & mushrooms', [], 'Grilled octopus, sweet potato mille-feuille, mushroom mousse and lemon.'] ] },
        { title: 'Mains', items: [
          ['American burger', [], 'Blend of premium Argentine cuts (220 g), aged cheddar, caramelized onion, house BBQ sauce and fries.'],
          ['Angus striploin', [], 'Angus striploin (250 g), charcoal grill and house chimichurri.'],
          ['Truffle potatoes', ['Vegetarian'], 'Confit crispy potatoes, goat cheese, truffle oil and chives.'],
          ['Beetroot hummus', ['Vegan'], 'Chickpea and beetroot hummus, whole-grain mustard, pickled radish, pickled onion, pickled turnip, fresh leaves, avocado mousse and smoked chili oil.'],
          ['Tiradito', [], 'Catch of the day over ají amarillo sauce, red pepper, touches of avocado, lemon, chili oil, cilantro oil and fresh onion.'],
          ['Shellfish pot', [], 'Clams and mussels in green sauce and tiger’s milk, creamy sweet potato and crunch.'],
          ['Cauliflower textures', [], 'Cauliflower cooked different ways, silky purée, toasted hazelnuts and smoked oil.'] ] },
        { title: 'Desserts', items: [
          ['Brownie', [], 'Walnut brownie, vanilla ice cream, red berries and mango gel.'],
          ['Raspberry cannelloni', [], 'Lúcuma ganache, chocolate soil, passion fruit ice cream and mango gel.'],
          ['Deconstructed lemon pie', [], 'Butter soil, lemon cream, lime gel, Italian meringue and white chocolate.'] ] }
      ]
    }
  }
};

/* Privacy policy text (English, exactly as provided; ready to translate). Block types: h (heading), p (paragraph), b (bold lead-in + text). */
window.BK_PRIVACY = {
  title: 'Privacy policy',
  blocks: [
    { t: 'p', x: 'This page briefly explains what is measured when you visit backroom-bar.com.' },
    { t: 'h', x: 'What the site measures' },
    { t: 'b', b: 'Meta pixel.', x: 'The pages of each location load that location’s Meta pixel (Buenos Aires or Santiago). The site does not record page visits: it only measures the click on a Book button, with an event called “Reservar” that carries the location, the language and the button. Meta may use cookies or browser identifiers for this; what Meta does with that information is governed by its own policy. This site does not store your personal data.' },
    { t: 'b', b: 'Tracked links.', x: 'When enabled, the “Open the booking page in a new tab” link goes through a short Backroom link that counts the click. For each visit only the referring domain, the device type and whether it looks like a bot are kept; the IP address and user agent are not stored.' },
    { t: 'h', x: 'Reservations' },
    { t: 'p', x: 'Bookings are made in a Meitre form embedded in this page. The data you enter there (name, contact details, date, time and party size) is received and processed by Meitre under its own privacy policy. This site does not collect or store that data.' },
    { t: 'h', x: 'Maps' },
    { t: 'p', x: 'The “How to get here” section includes an embedded Google Map. When it loads, Google may receive your IP address and browser data.' },
    { t: 'h', x: 'What is stored in your browser' },
    { t: 'p', x: 'The site stores in your browser (localStorage) the location you chose, to offer you a quick way back. That value is not sent to any server and you can delete it from your browser settings.' },
    { t: 'p', x: 'Privacy inquiries: rrhh@backroom-bar.com' },
    { t: 'p', x: 'Controllers: Backroom SRL (Buenos Aires, Argentina) for Backroom Buenos Aires, and Backroom Chile SpA (Santiago, Chile) for Backroom Santiago.' },
    { t: 'p', x: 'Last updated: 12/10/2026.' }
  ]
};
