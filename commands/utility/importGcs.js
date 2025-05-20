const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

module.exports = {
  data: new SlashCommandBuilder()
    .setName('importar')
    .setDescription('Importe uma ficha GURPS (.gcs JSON)')
    .addAttachmentOption(option =>
      option.setName('arquivo')
        .setDescription('Arquivo .gcs (JSON exportado do GCS)')
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const file = interaction.options.getAttachment('arquivo');

      if (!file.name.endsWith('.gcs')) {
        return interaction.editReply({ content: 'Por favor, envie um arquivo `.gcs` válido.', ephemeral: true });
      }

      const response = await fetch(file.url);
      const jsonText = await response.text();

      let data;
      try {
        data = JSON.parse(jsonText);
      } catch {
        return interaction.editReply({ content: 'Arquivo JSON inválido.', ephemeral: true });
      }

      // Extrair dados básicos do personagem
      const perfil = data.profile || {};
      const nome = perfil.name || 'Sem nome';
      const idade = perfil.age || 'Desconhecida';
      const genero = perfil.gender || 'Desconhecido';
      let alturaRaw = perfil.height || 'Desconhecido';
let pesoRaw = perfil.weight || 'Desconhecido';


const parsePeso = (value) => {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return value;
  // Supondo que o valor esteja em libras, converte para kg
  const kg = parsed * 0.453592;
  return `${kg.toFixed(1)} kg`;
};
function parseHeightImperial(heightStr) {
  const regex = /(\d+)'(\d+(\.\d+)?)"/;
  const match = heightStr.match(regex);
  if (!match) return heightStr; // caso já esteja em metros

  const feet = parseInt(match[1], 10);
  const inches = parseFloat(match[2]);

  const totalInches = feet * 12 + inches;
  const meters = totalInches * 0.0254;

  return `${meters.toFixed(2)} m`;
}

const altura = parseHeightImperial(alturaRaw);
const peso = parsePeso(pesoRaw);

      // Atributos do JSON que você passou
      const atributos = data.attributes || [];
      const traits = data.traits || [];
      // Função para pegar valor do atributo pelo attr_id (usa calc.value)
      const getAttrValue = (attr_id) => {
        const attr = atributos.find(a => a.attr_id === attr_id);
        return attr ? attr.calc.value : '??';
      };


      const st = getAttrValue('st');
      const dx = getAttrValue('dx');
      const iq = getAttrValue('iq');
      const ht = getAttrValue('ht');
      const wil = getAttrValue('will');  // 'will' no JSON, não 'wil'
      const per = getAttrValue('per');
      const des = getAttrValue('basic_move');
      const velBas = getAttrValue('basic_speed');
      const visao = getAttrValue('vision');
      const audicao = getAttrValue('hearing');
      const paladarOlfato = getAttrValue('taste_smell');
      const tato = getAttrValue('touch');
      const hp = getAttrValue('hp');
      const fp = getAttrValue('fp');
      const gdp = data.calc?.thrust || '??'; // GDP = thrust
      const geb = data.calc?.swing || '??';  // GEB = swing
      const bc = ((getAttrValue('st')*getAttrValue('st'))/10);

      // MT e NT (só peguei do profile, você pode adaptar se for outro lugar)
      const mt = perfil.mt || '??';
      const nt = perfil.nt || '??';

      // Campos que você quer preencher, por hora placeholders (pode adaptar se tiver no JSON)
      const reacoes = "Nenhuma";

      //CODIGO QUE PEGA AS VANTAGENS DO JSON
      const vantagensNode = traits.find(t => t.name?.toLowerCase() === "vantagens");
const vantagens = vantagensNode?.children?.length
  ? vantagensNode.children
      .filter(v => v.name?.toLowerCase() !== "desvantagens") // <- filtrando esse erro
      .map(v => `• ${v.name}${v.modifiers?.length ? ` (${v.modifiers.map(m => m.name).join(', ')})` : ''} [${v.calc?.points ?? v.base_points ?? '?'} pts]`)
      .join('\n')
  : 'Nenhuma';

//CODIGO QUE BUSCA DESVANTAGENS NO JSON
const vantagensNodeParaDesvantagens = traits.find(t => t.name?.toLowerCase() === "vantagens");

const desvantagensDentroVantagens = vantagensNodeParaDesvantagens?.children?.filter(child =>
  child.tags?.includes("Disadvantage")
) || [];

const totalDesvantagens = desvantagensDentroVantagens.reduce((acc, d) => acc + (d.calc?.points || 0), 0);

const desvantagensStr = desvantagensDentroVantagens.length > 0
  ? desvantagensDentroVantagens.map(d => `• ${d.name} [${d.calc.points} pts]`).join('\n')
  : 'Nenhuma desvantagem cadastrada';

//FIM DO BLOCO

// CODIGO QUE BUSCA AS PERICIAS NO JSON
const periciasNode = data.skills || [];

function extrairSkills(skillsArray) {
  let resultado = [];
  for (const skillGroup of skillsArray) {
    if (skillGroup.children && skillGroup.children.length) {
      resultado = resultado.concat(extrairSkills(skillGroup.children));
    } else {
      resultado.push(skillGroup);
    }
  }
  return resultado;
}

const todasSkills = periciasNode.length ? extrairSkills(periciasNode) : [];

const pericias = todasSkills.length
  ? todasSkills.map(s => `• ${s.name} [${s.points ?? 0} pts]`).join('\n')
  : 'Nenhuma perícia cadastrada.';



  


      // Montar embed
     const embed = new EmbedBuilder()
  .setTitle(`📜 Ficha de ${nome} 📜`)
  .setDescription(`👤 **Idade:** ${idade}  🚻 **Gênero:** ${genero} 📏 **Altura:** ${altura} ⚖️ **Peso:** ${peso}\n` +
  `🧠 **MT:** ${mt}  📚 **NT:** ${nt}`)
  .addFields(
    { name: "⚙️ Atributos", value: `ST: **${st}** | DX: **${dx}** | IQ: **${iq}** | HT: **${ht}**`, inline: true },
    { name: "🔧 Secundários", value: `Von: **${wil}** | Per: **${per}** | Des. Basico: **${des}** | Vel. Básica: **${velBas}**`, inline: true },
    { name: "👁️ Sentidos", value: `Visão: **${visao}** | Audição: **${audicao}** | Paladar/Olfato: **${paladarOlfato}** | Tato: **${tato}**`, inline: true },
    { name: "❤️ Vida e Energia", value: `HP: **${hp}** | FP: **${fp}** | GDP: **${gdp}** | GEB: **${geb}** \n| BC: **${bc}**Kg`, inline: true },
    { name: '⚡ REAÇÕES', value: reacoes, inline: true },
    { name: '⭐ VANTAGENS', value: vantagens, inline: false },
    {
  name: `❌ DESVANTAGENS [${Math.abs(totalDesvantagens)} pts]`,
  value: desvantagensStr,
  inline: false
}
,
    { name: '🛠️ PERÍCIAS', value: pericias, inline: false },
   
  )
  .setColor(0x00AE86)
  .setFooter({ text: 'Hotel dos Parças™ © | Primeiro port de GCS pro Discord' });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Erro ao importar ficha:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Ocorreu um erro ao importar a ficha.', ephemeral: true });
      } else {
        await interaction.editReply({ content: 'Ocorreu um erro ao importar a ficha.' });
      }
    }
  }
};
