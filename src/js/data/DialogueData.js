/**
 * 对话数据
 * 定义游戏中NPC的对话内容
 */

const DialogueData = {
  // 部落酋长对话
  'tribal_chief': {
    // 默认对话
    'default': [
      {
        speaker: '部落酋长',
        content: '欢迎来到我们的部落，勇士。'
      },
      {
        speaker: '部落酋长',
        content: '我们部落的战士以勇猛著称，你看起来也有成为伟大战士的潜质。'
      }
    ],
    
    // 战士第一章 - 狩猎任务前对话
    'before_warrior_ch1_hunting': [
      {
        speaker: '部落酋长',
        content: '我们的食物储备不多了，需要有人去狩猎。'
      },
      {
        speaker: '部落酋长',
        content: '森林里有很多野猪，它们的肉是上好的食材。'
      },
      {
        speaker: '部落酋长',
        content: '你能帮我们猎杀一些野猪吗？最好能找到并击败它们的首领。',
        options: [
          {
            text: '我愿意帮忙',
            action: 'startQuest',
            questId: 'warrior_ch1_hunting'
          },
          {
            text: '现在没空',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 狩猎任务进行中对话
    'during_warrior_ch1_hunting': [
      {
        speaker: '部落酋长',
        content: '野猪主要在森林的南部活动，小心它们的獠牙。'
      },
      {
        speaker: '部落酋长',
        content: '据说有一头体型巨大的猪王，它是野猪群的首领。如果能击败它，将是一项伟大的成就。'
      }
    ],
    
    // 狩猎任务完成后对话
    'after_warrior_ch1_hunting': [
      {
        speaker: '部落酋长',
        content: '干得好！你不仅带回了足够的肉，还击败了猪王！'
      },
      {
        speaker: '部落酋长',
        content: '你的勇气和实力令人钦佩，这是我们部落的传统武器，希望它能帮助你在战斗中取得胜利。'
      },
      {
        speaker: '部落酋长',
        content: '但我们没有时间庆祝。有一个神秘的武士入侵了我们的领地，他拥有不寻常的力量。'
      },
      {
        speaker: '部落酋长',
        content: '他现在在村庄西边的古老祭坛附近。我需要你去调查并阻止他。',
        options: [
          {
            text: '我会去对付他',
            action: 'startQuest',
            questId: 'warrior_ch1_intruder'
          },
          {
            text: '我需要先休息一下',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 入侵者任务进行中对话
    'during_warrior_ch1_intruder': [
      {
        speaker: '部落酋长',
        content: '那个入侵者非常危险，据说他能使用一种奇怪的力量。'
      },
      {
        speaker: '部落酋长',
        content: '小心行事，但不要退缩。我相信你能够战胜他。'
      }
    ],
    
    // 入侵者任务完成后对话
    'after_warrior_ch1_intruder': [
      {
        speaker: '部落酋长',
        content: '你击败了那个神秘的入侵者？令人印象深刻！'
      },
      {
        speaker: '部落酋长',
        content: '你说他在战斗中展现出了一种特殊的力量？这听起来像是古老传说中的觉醒能力。'
      },
      {
        speaker: '部落酋长',
        content: '我们部落的古老卷轴中提到过这种力量。它被称为"觉醒"，是一种潜藏在特定个体内的强大能量。'
      },
      {
        speaker: '部落酋长',
        content: '你从他身上找到的徽章...让我看看。',
        options: [
          {
            text: '给酋长看徽章',
            action: 'startQuest',
            questId: 'warrior_ch1_revelation'
          }
        ]
      }
    ],
    
    // 觉醒线索任务对话
    'during_warrior_ch1_revelation': [
      {
        speaker: '部落酋长',
        content: '这个徽章上的符文...它来自远东的神秘圣地！'
      },
      {
        speaker: '部落酋长',
        content: '传说那里有一位古老的贤者，他掌握着觉醒之力的秘密。'
      },
      {
        speaker: '部落酋长',
        content: '我相信你体内也蕴含着这种力量，只是尚未被唤醒。'
      },
      {
        speaker: '部落酋长',
        content: '你必须前往那个圣地，寻找觉醒的方法。这是一张古老的地图，它会指引你找到那个地方。'
      },
      {
        speaker: '系统',
        content: '获得物品：古老地图'
      },
      {
        speaker: '部落酋长',
        content: '这将是一段艰难的旅程，但我相信你有能力完成它。准备好出发了吗？',
        options: [
          {
            text: '我准备好了',
            action: 'startQuest',
            questId: 'warrior_ch1_departure'
          },
          {
            text: '我需要更多准备',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 离开聚落任务对话
    'during_warrior_ch1_departure': [
      {
        speaker: '部落酋长',
        content: '这些补给会在旅途中帮助你。还有这个战士符文，它是我们部落的传家宝。'
      },
      {
        speaker: '系统',
        content: '获得物品：旅行补给、战士符文'
      },
      {
        speaker: '部落酋长',
        content: '记住，真正的力量来自内心。无论你在哪里，都带着部落的荣耀。'
      },
      {
        speaker: '部落酋长',
        content: '当你找到觉醒之力后，回来告诉我们你的故事。愿先祖保佑你的旅程。'
      },
      {
        speaker: '系统',
        content: '战士第一章完成！你已踏上觉醒之路的旅程。'
      }
    ],
    
    // 第一章完成后对话
    'after_warrior_ch1_departure': [
      {
        speaker: '部落酋长',
        content: '你的旅程才刚刚开始，年轻的战士。愿你在寻找觉醒之力的道路上找到真正的自我。'
      },
      {
        speaker: '部落酋长',
        content: '记住，无论你走到哪里，这里永远是你的家。'
      }
    ]
  },
  
  // 神秘人对话
   'mysterious_stranger': {
     // 遭遇对话
     'encounter': [
       {
         speaker: '神秘人',
         content: '你不该来这里，勇士！'
       },
       {
         speaker: '玩家',
         content: '你是谁？为什么在我们的领地？'
       },
       {
         speaker: '神秘人',
         content: '我的身份对你而言并不重要。你只需知道，你阻挡了不该阻挡的人。'
       },
       {
         speaker: '玩家',
         content: '我不会让你伤害我的部落！'
       },
       {
         speaker: '神秘人',
         content: '勇气可嘉，但实力不足。让我看看你有多少本事！',
         options: [
           {
             text: '战斗',
             action: 'startBattle',
             enemyId: 'mysterious_stranger'
           }
         ]
       }
     ],
     
     // 觉醒时对话
     'awakening': [
       {
         speaker: '神秘人',
         content: '现在，感受真正的力量吧！'
       }
     ],
     
     // 击败玩家后对话
     'victory': [
       {
         speaker: '神秘人',
         content: '你还太弱小...去寻找真正的力量吧...'
       },
       {
         speaker: '神秘人',
         content: '只有掌握觉醒之力，你才有资格与我一战。'
       }
     ]
   },
  // 村长对话
  'village_elder': {
    // 默认对话
    'default': [
      {
        speaker: '村长',
        content: '欢迎来到我们的村庄，年轻的冒险者。'
      },
      {
        speaker: '村长',
        content: '这里虽然平静，但最近边境地区有些不安宁的传言。'
      }
    ],
    
    // 任务前对话
    'before_main_start': [
      {
        speaker: '村长',
        content: '你看起来是个有潜力的冒险者。我们村里流传着一个古老的传说...'
      },
      {
        speaker: '村长',
        content: '传说中，有一种被称为"觉醒"的力量，能够让拥有者发挥出超越常人的能力。'
      },
      {
        speaker: '村长',
        content: '我年轻时曾经见过一位觉醒者，他的力量令人难以置信。'
      },
      {
        speaker: '村长',
        content: '如果你有兴趣了解更多，可以去村外的古老神殿看看。那里可能有关于觉醒力量的线索。',
        options: [
          {
            text: '我会去调查神殿',
            action: 'startQuest',
            questId: 'main_start'
          },
          {
            text: '现在不感兴趣',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 任务进行中对话
    'during_main_start': [
      {
        speaker: '村长',
        content: '神殿在村庄东边的森林里。小心前行，那里可能有危险。'
      }
    ],
    
    // 任务完成后对话
    'after_main_start': [
      {
        speaker: '村长',
        content: '你找到了什么？古老的卷轴？这可能是解开觉醒之谜的关键！'
      },
      {
        speaker: '村长',
        content: '你应该去见见住在山顶塔楼的贤者。他对这些古老的知识很有研究。'
      }
    ],
    
    // 游戏后期对话
    'late_game': [
      {
        speaker: '村长',
        content: '看看你，已经成长为一位强大的觉醒者了。我为你感到骄傲。'
      },
      {
        speaker: '村长',
        content: '请记住，力量越大，责任也越大。希望你能用你的能力保护这片土地。'
      }
    ]
  },
  
  // 贤者对话
  'sage_mentor': {
    // 默认对话
    'default': [
      {
        speaker: '贤者',
        content: '知识是力量，但智慧才是正确使用力量的关键。'
      }
    ],
    
    // 任务前对话
    'before_main_power_awakening': [
      {
        speaker: '贤者',
        content: '我感觉到你身上有特殊的气息，年轻人。'
      },
      {
        speaker: '贤者',
        content: '你带来了古老的卷轴？让我看看...',
      },
      {
        speaker: '贤者',
        content: '这确实是关于觉醒力量的记载。根据这卷轴所述，觉醒是一种来自内心的力量，需要特定的仪式和条件才能激发。'
      },
      {
        speaker: '贤者',
        content: '我可以帮你解读这卷轴，并指导你完成觉醒仪式。但要知道，一旦开始，就没有回头路了。',
        options: [
          {
            text: '我准备好了',
            action: 'startQuest',
            questId: 'main_power_awakening'
          },
          {
            text: '我需要再考虑一下',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 任务进行中对话
    'during_main_power_awakening': [
      {
        speaker: '贤者',
        content: '解读古老的文字需要时间。同时，你可以准备一些仪式需要的材料。'
      },
      {
        speaker: '贤者',
        content: '我们需要三种元素水晶和一些特殊的草药。这些东西在附近的洞穴和森林中应该能找到。'
      }
    ],
    
    // 仪式对话
    'ritual_dialogue': [
      {
        speaker: '贤者',
        content: '材料都准备好了。现在，让我们开始觉醒仪式。'
      },
      {
        speaker: '贤者',
        content: '闭上眼睛，感受你内心深处的力量。每个人的觉醒形式都不同，取决于你的本性和经历。'
      },
      {
        speaker: '贤者',
        content: '让你的意识沉入内心深处，寻找那股潜藏的力量...',
      },
      {
        speaker: '贤者',
        content: '现在，释放它！',
      },
      {
        speaker: '系统',
        content: '一股强大的能量从你体内爆发出来！你感到前所未有的力量充满全身！',
      },
      {
        speaker: '贤者',
        content: '做得好！你已经成功唤醒了内在的力量。这只是开始，随着你的成长，你将解锁更多觉醒能力。'
      },
      {
        speaker: '贤者',
        content: '记住，觉醒力量与你的情感和经历紧密相连。在战斗和冒险中，特定的条件可能会触发新的觉醒。'
      }
    ],
    
    // 任务完成后对话
    'after_main_power_awakening': [
      {
        speaker: '贤者',
        content: '你现在已经是一名觉醒者了。但要小心，有传言说黑暗势力正在寻找觉醒者。'
      },
      {
        speaker: '贤者',
        content: '你应该去王城，向国王的骑士团报告这件事。他们需要知道这些信息。'
      }
    ]
  },
  
  // 皇家骑士对话
  'royal_knight': {
    // 默认对话
    'default': [
      {
        speaker: '皇家骑士',
        content: '为了王国的荣耀！'
      }
    ],
    
    // 任务前对话
    'before_main_dark_forces': [
      {
        speaker: '皇家骑士',
        content: '你就是那个觉醒者？正好，我们需要你的帮助。'
      },
      {
        speaker: '皇家骑士',
        content: '边境地区最近出现了一些奇怪的活动。有人看到黑袍人在进行某种仪式。'
      },
      {
        speaker: '皇家骑士',
        content: '我们怀疑他们可能与传说中的"暗影教团"有关，那是一个追求禁忌力量的邪恶组织。'
      },
      {
        speaker: '皇家骑士',
        content: '作为觉醒者，你的能力可能对调查这件事至关重要。你愿意帮助我们吗？',
        options: [
          {
            text: '我会帮助调查',
            action: 'startQuest',
            questId: 'main_dark_forces'
          },
          {
            text: '我需要时间准备',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 任务进行中对话
    'during_main_dark_forces': [
      {
        speaker: '皇家骑士',
        content: '边境指挥官在东部前哨站。他会给你更多关于黑暗势力的信息。'
      },
      {
        speaker: '皇家骑士',
        content: '小心行事，我们不知道敌人的实力如何。'
      }
    ],
    
    // 任务完成后对话
    'after_main_dark_forces': [
      {
        speaker: '皇家骑士',
        content: '你的发现令人担忧。暗影教团正在寻找古老的邪恶力量，这对整个王国都是威胁。'
      },
      {
        speaker: '皇家骑士',
        content: '我会立即向国王报告。同时，你应该继续提升自己的觉醒能力，准备迎接更大的挑战。'
      }
    ]
  },
  
  // 武术大师对话
  'master_warrior': {
    // 默认对话
    'default': [
      {
        speaker: '武术大师',
        content: '真正的战士不仅仅依靠蛮力，还需要智慧和毅力。'
      }
    ],
    
    // 任务前对话
    'before_warrior_trial': [
      {
        speaker: '武术大师',
        content: '我听说你是一位觉醒者战士。有趣。'
      },
      {
        speaker: '武术大师',
        content: '力量没有捷径，即使是觉醒者也需要通过严格的训练来掌握自己的能力。'
      },
      {
        speaker: '武术大师',
        content: '如果你想真正掌握战士的觉醒力量，就必须通过我的试炼。'
      },
      {
        speaker: '武术大师',
        content: '试炼包括三个部分：力量、耐力和技巧。你准备好接受挑战了吗？',
        options: [
          {
            text: '我接受挑战',
            action: 'startQuest',
            questId: 'warrior_trial'
          },
          {
            text: '我需要更多准备',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 任务进行中对话
    'during_warrior_trial': [
      {
        speaker: '武术大师',
        content: '专注于你的目标，战胜自己的弱点。'
      },
      {
        speaker: '武术大师',
        content: '真正的战士知道何时进攻，何时防守，何时撤退。'
      }
    ],
    
    // 任务完成后对话
    'after_warrior_trial': [
      {
        speaker: '武术大师',
        content: '做得好，年轻的战士。你已经证明了自己的价值。'
      },
      {
        speaker: '武术大师',
        content: '现在，让我教你如何唤醒战争领主的力量，这是战士最强大的觉醒形态之一。'
      },
      {
        speaker: '武术大师',
        content: '记住，真正的力量来自内心的平静和坚定的意志。'
      },
      {
        speaker: '系统',
        content: '你已解锁战争领主觉醒能力！'
      }
    ]
  },
  
  // 大法师对话
  'archmage': {
    // 默认对话
    'default': [
      {
        speaker: '大法师',
        content: '魔法是一门需要耐心和理解的艺术。'
      }
    ],
    
    // 任务前对话
    'before_mage_trial': [
      {
        speaker: '大法师',
        content: '我感觉到你体内流动的魔法能量。你是一位觉醒者法师，对吗？'
      },
      {
        speaker: '大法师',
        content: '觉醒的力量与魔法有着深厚的联系。但要真正掌握这种力量，你需要更深入地理解魔法的本质。'
      },
      {
        speaker: '大法师',
        content: '我可以指导你完成法师的试炼，这将帮助你解锁更强大的觉醒能力。'
      },
      {
        speaker: '大法师',
        content: '试炼将测试你对元素魔法的掌握、解决问题的能力以及面对幻象的勇气。你准备好了吗？',
        options: [
          {
            text: '我准备接受试炼',
            action: 'startQuest',
            questId: 'mage_trial'
          },
          {
            text: '我需要更多时间准备',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 任务进行中对话
    'during_mage_trial': [
      {
        speaker: '大法师',
        content: '魔法的本质是理解和控制元素的流动。'
      },
      {
        speaker: '大法师',
        content: '不要只看表象，真正的谜题往往隐藏在细节之中。'
      }
    ],
    
    // 任务完成后对话
    'after_mage_trial': [
      {
        speaker: '大法师',
        content: '令人印象深刻！你已经展示了真正法师应有的智慧和勇气。'
      },
      {
        speaker: '大法师',
        content: '现在，让我向你传授时间法师的秘密，这是最强大也是最危险的觉醒能力之一。'
      },
      {
        speaker: '大法师',
        content: '时间是最神秘的力量，操控它需要极大的谨慎。使用这种力量时，请记住平衡的重要性。'
      },
      {
        speaker: '系统',
        content: '你已解锁时间法师觉醒能力！'
      }
    ]
  },
  
  // 猎人大师对话
  'master_hunter': {
    // 默认对话
    'default': [
      {
        speaker: '猎人大师',
        content: '在森林中，敏锐的感官和精准的射击同样重要。'
      }
    ],
    
    // 任务前对话
    'before_archer_trial': [
      {
        speaker: '猎人大师',
        content: '你走路的方式告诉我，你是个弓箭手。而你眼中的光芒显示你是个觉醒者。'
      },
      {
        speaker: '猎人大师',
        content: '觉醒的力量可以让你成为传奇的射手，但前提是你必须掌握真正的猎人技巧。'
      },
      {
        speaker: '猎人大师',
        content: '我的试炼将测试你的精准度、狩猎能力和应变能力。'
      },
      {
        speaker: '猎人大师',
        content: '如果你通过了，我会教你如何唤醒神射手的力量。你愿意接受挑战吗？',
        options: [
          {
            text: '我接受挑战',
            action: 'startQuest',
            questId: 'archer_trial'
          },
          {
            text: '我需要更多准备',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 任务进行中对话
    'during_archer_trial': [
      {
        speaker: '猎人大师',
        content: '一个好的猎人知道如何等待最佳时机。'
      },
      {
        speaker: '猎人大师',
        content: '观察你的目标，了解它的行为模式，然后再出手。'
      }
    ],
    
    // 任务完成后对话
    'after_archer_trial': [
      {
        speaker: '猎人大师',
        content: '精彩的表现！你的箭术和直觉都令人印象深刻。'
      },
      {
        speaker: '猎人大师',
        content: '现在，让我教你如何唤醒神射手的力量，这是弓箭手最强大的觉醒形态。'
      },
      {
        speaker: '猎人大师',
        content: '神射手的箭矢能穿透一切障碍，但记住，真正的猎人只在必要时才会射箭。'
      },
      {
        speaker: '系统',
        content: '你已解锁神射手觉醒能力！'
      }
    ]
  },
  
  // 村民对话
  'worried_parent': {
    // 默认对话
    'default': [
      {
        speaker: '担忧的父母',
        content: '我的孩子还没回来，我真的很担心...'
      }
    ],
    
    // 任务前对话
    'before_side_lost_child': [
      {
        speaker: '担忧的父母',
        content: '冒险者，请帮帮我！我的孩子去森林里采蘑菇，到现在还没回来！'
      },
      {
        speaker: '担忧的父母',
        content: '最近有狼群在森林里出没，我担心孩子遇到危险。'
      },
      {
        speaker: '担忧的父母',
        content: '请你帮我找找我的孩子好吗？我会报答你的！',
        options: [
          {
            text: '我会帮你找回孩子',
            action: 'startQuest',
            questId: 'side_lost_child'
          },
          {
            text: '抱歉，我现在有急事',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 任务进行中对话
    'during_side_lost_child': [
      {
        speaker: '担忧的父母',
        content: '我的孩子喜欢在森林东部的小溪边玩耍，也许你可以从那里开始找。'
      },
      {
        speaker: '担忧的父母',
        content: '请快点，天色已晚，森林在夜晚更加危险。'
      }
    ],
    
    // 任务完成后对话
    'after_side_lost_child': [
      {
        speaker: '担忧的父母',
        content: '我的孩子！感谢你把他安全带回来！'
      },
      {
        speaker: '担忧的父母',
        content: '这些药草是我们家传的配方，希望对你的冒险有所帮助。'
      },
      {
        speaker: '担忧的父母',
        content: '我们村子不会忘记你的善举的。'
      }
    ]
  },
  
  // 药剂师对话
  'village_alchemist': {
    // 默认对话
    'default': [
      {
        speaker: '村庄药剂师',
        content: '欢迎光临我的药剂店。需要什么药水吗？'
      }
    ],
    
    // 任务前对话
    'before_side_rare_herbs': [
      {
        speaker: '村庄药剂师',
        content: '啊，一位冒险者！正好，我需要一些帮助。'
      },
      {
        speaker: '村庄药剂师',
        content: '我正在研制一种新的药剂，但需要一些稀有药草。这些药草生长在危险的地方，我自己去采集太冒险了。'
      },
      {
        speaker: '村庄药剂师',
        content: '红色药草生长在火山附近，蓝色药草在冰冻湖泊边，而金色药草只在古老神殿的废墟中才能找到。'
      },
      {
        speaker: '村庄药剂师',
        content: '如果你能帮我收集这些药草，我会用我最好的药剂回报你。怎么样？',
        options: [
          {
            text: '我会帮你收集药草',
            action: 'startQuest',
            questId: 'side_rare_herbs'
          },
          {
            text: '这些地方太远了，抱歉',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 任务进行中对话
    'during_side_rare_herbs': [
      {
        speaker: '村庄药剂师',
        content: '采集药草时要小心，特别是金色药草，它们通常被一些古老的守护者保护着。'
      },
      {
        speaker: '村庄药剂师',
        content: '记得带上适当的装备，不同地区的环境差异很大。'
      }
    ],
    
    // 任务完成后对话
    'after_side_rare_herbs': [
      {
        speaker: '村庄药剂师',
        content: '太棒了！你带回了所有我需要的药草！'
      },
      {
        speaker: '村庄药剂师',
        content: '正如承诺的，这些是我最好的药剂。生命灵药可以在危急时刻救你一命，而魔力灵药则能恢复大量魔法力。'
      },
      {
        speaker: '村庄药剂师',
        content: '如果你以后需要更多药剂，随时来找我。作为感谢，我会给你特别优惠。'
      }
    ]
  },
  
  // 矿工头目对话
  'mine_foreman': {
    // 默认对话
    'default': [
      {
        speaker: '矿工头目',
        content: '这座矿井曾经是我们村子的主要收入来源，直到那件事发生...'
      }
    ],
    
    // 任务前对话
    'before_side_haunted_mine': [
      {
        speaker: '矿工头目',
        content: '你看起来是个能干的冒险者。也许你能帮我们解决一个问题。'
      },
      {
        speaker: '矿工头目',
        content: '我们的矿井最近据说闹鬼了。矿工们听到奇怪的声音，看到诡异的光，没人敢进去工作了。'
      },
      {
        speaker: '矿工头目',
        content: '我怀疑这不是什么鬼魂，而是有人在捣鬼。但我需要证据。'
      },
      {
        speaker: '矿工头目',
        content: '你能帮我调查一下矿井吗？找出真相，让矿工们能重返工作岗位。',
        options: [
          {
            text: '我会调查矿井',
            action: 'startQuest',
            questId: 'side_haunted_mine'
          },
          {
            text: '我对鬼故事不感兴趣',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 任务进行中对话
    'during_side_haunted_mine': [
      {
        speaker: '矿工头目',
        content: '矿井在村子西边。带上灯，里面很黑。'
      },
      {
        speaker: '矿工头目',
        content: '如果真的有鬼，小心点。如果是人为的，找出是谁在搞鬼。'
      }
    ],
    
    // 任务完成后对话
    'after_side_haunted_mine': [
      {
        speaker: '矿工头目',
        content: '盗贼？我就知道不是什么鬼魂！他们一定是想吓跑矿工，独占矿井里的宝石。'
      },
      {
        speaker: '矿工头目',
        content: '感谢你揭露了真相。这把特制的矿镐是我们矿工的象征，现在它是你的了。'
      },
      {
        speaker: '矿工头目',
        content: '另外，这块宝石碎片是我们在矿井深处发现的。它似乎有某种魔力，也许对你有用。'
      }
    ]
  },
  
  // 学者对话
  'scholar': {
    // 默认对话
    'default': [
      {
        speaker: '学者',
        content: '知识就是力量，而古代文明的知识尤为珍贵。'
      }
    ],
    
    // 任务前对话
    'before_side_ancient_artifact': [
      {
        speaker: '学者',
        content: '你好，冒险者。我在研究一个古老文明，据说他们创造了强大的神器。'
      },
      {
        speaker: '学者',
        content: '我的研究表明，其中一件神器可能隐藏在这片大陆的某处。它被称为"先知之眼"，据说能预见未来。'
      },
      {
        speaker: '学者',
        content: '如果能找到它，不仅对我的研究有巨大帮助，对了解觉醒力量的起源也至关重要。'
      },
      {
        speaker: '学者',
        content: '你愿意帮我寻找这件神器吗？我会分享我所有的研究成果作为回报。',
        options: [
          {
            text: '我会帮你寻找神器',
            action: 'startQuest',
            questId: 'side_ancient_artifact'
          },
          {
            text: '抱歉，我对考古不感兴趣',
            action: 'closeDialogue'
          }
        ]
      }
    ],
    
    // 任务进行中对话
    'during_side_ancient_artifact': [
      {
        speaker: '学者',
        content: '首先需要在皇家图书馆研究古籍，那里有关于神器的线索。'
      },
      {
        speaker: '学者',
        content: '找到藏宝图后，你需要前往被遗忘的遗迹。小心，那里可能有古老的守护者。'
      }
    ],
    
    // 任务完成后对话
    'after_side_ancient_artifact': [
      {
        speaker: '学者',
        content: '不可思议！你真的找到了"先知之眼"！这将彻底改变我们对古代文明的理解！'
      },
      {
        speaker: '学者',
        content: '正如承诺的，这是我的研究笔记。其中包含了关于觉醒力量的重要发现。'
      },
      {
        speaker: '学者',
        content: '根据我的研究，觉醒力量与古代文明有着密切的联系。这个神器可能会帮助你解锁新的觉醒能力。'
      },
      {
        speaker: '系统',
        content: '你获得了新的觉醒能力解锁条件！'
      }
    ]
  }
};

export default DialogueData;