document.addEventListener('DOMContentLoaded', function() {
	// DOM要素
	const chatIcon = document.getElementById('chat-icon');
	const chatWindow = document.getElementById('chat-window');
	const chatClose = document.getElementById('chat-close');
	const chatMessages = document.getElementById('chat-messages');
	const chatInput = document.getElementById('chat-input');
	const chatSendBtn = document.getElementById('chat-send-btn');
	
	// テナント設定
	const tenantSettings = {
			'default': {
					colors: {
							primary: '#0070c0',
							secondary: '#e3f2fd',
							background: '#f5f5f5'
					},
					messages: {
							welcome: "こんにちは！当社のチャットボットへようこそ。どのようにお手伝いできますか？",
							fallback: "申し訳ありません、お答えできません。"
					},
					branding: {
							title: "企業チャットサポート",
							label: "サポート"
					},
					language: "ja", // 言語設定を追加
					rasaEndpoint: 'http://localhost:5005/webhooks/rest/webhook'
			},
			'tenant_A': {
					colors: {
							primary: '#4caf50',
							secondary: '#e8f5e9',
							background: '#f5f5f5'
					},
					messages: {
							welcome: "こんにちは！テナントAのサポートチャットへようこそ。ご質問をどうぞ。",
							fallback: "申し訳ありません、現在その質問にはお答えできません。"
					},
					branding: {
							title: "テナントA サポート",
							label: "テナントA"
					},
					language: "ja", // 言語設定を追加
					rasaEndpoint: 'http://localhost:5005/webhooks/rest/webhook'
			},
			'tenant_B': {
					colors: {
						  primary: '#8bc34a',
							secondary: '#f1f8e9',
							background: '#f5f5f5'
					},
					messages: {
							welcome: "Welcome to Tenant B support chat. How can I help you today?", // 英語に変更
							fallback: "I'm sorry, I cannot answer that question. Please contact us directly for more details." // 英語に変更
					},
					branding: {
							title: "Tenant B Support", // 英語に変更
							label: "Support" // 英語に変更
					},
					language: "en", // 英語に設定
					rasaEndpoint: 'http://localhost:5005/webhooks/rest/webhook'
			},
      'tenant_C': {
          colors: {
              primary: '#2196f3',
              secondary: '#e3f2fd',
              background: '#f5f5f5'
          },
          messages: {
              welcome: "こんにちは！テナントCのチャットボットです。RASAと連携しています。",
              fallback: "申し訳ありません、現在その質問にはお答えできません。"
          },
          branding: {
              title: "テナントC サポート",
              label: "テナントC"
          },
          language: "ja",
          rasaEndpoint: 'http://localhost:5005/webhooks/rest/webhook'
      }
	};
	
	// URLからテナントIDを取得
	const urlParams = new URLSearchParams(window.location.search);
	const tenantId = urlParams.get('tenant') || 'default';
	const settings = tenantSettings[tenantId] || tenantSettings['default'];
	
	// セッションID生成
	const sessionId = generateSessionId();
	
	// テナント固有のスタイルを適用
	applyTenantStyles(settings.colors);
	
	// テナント固有のテキストを適用
	applyTenantBranding(settings.branding);
	
	// チャットアイコンクリック - チャットウィンドウを開く
	chatIcon.addEventListener('click', function() {
			chatWindow.style.display = 'flex';
			chatIcon.style.display = 'none';
			
			// 初期メッセージがまだ表示されていない場合
			if (chatMessages.children.length === 0) {
					addBotMessage(settings.messages.welcome);
          
          // 初期選択肢を表示（テナントA、Bの場合）
          if (tenantId === 'tenant_A' || tenantId === 'tenant_B' || tenantId === 'default') {
              setTimeout(() => showOptions(tenantId), 1000);
          }
			}
	});
	
	// 閉じるボタンクリック - チャットウィンドウを閉じる
	chatClose.addEventListener('click', function() {
			chatWindow.style.display = 'none';
			chatIcon.style.display = 'flex';
	});
	
	// 送信ボタンクリック
	chatSendBtn.addEventListener('click', sendMessage);
	
	// エンターキー押下で送信
	chatInput.addEventListener('keypress', function(e) {
			if (e.key === 'Enter') {
					sendMessage();
			}
	});
	
	// テナント固有のスタイルを適用する関数
	function applyTenantStyles(colors) {
			const root = document.documentElement;
			
			// CSSカスタムプロパティを設定
			root.style.setProperty('--primary-color', colors.primary);
			root.style.setProperty('--secondary-color', colors.secondary);
			root.style.setProperty('--background-color', colors.background);
			
			// 直接スタイル適用（必要な場合）
			document.querySelector('.chat-icon').style.backgroundColor = colors.primary;
			document.querySelector('.chat-header').style.backgroundColor = colors.primary;
			document.querySelector('.chat-send-btn').style.backgroundColor = colors.primary;
			document.querySelector('.chat-icon-label').style.backgroundColor = colors.primary;
	}
	
	// テナント固有のブランディングを適用する関数
	function applyTenantBranding(branding) {
			// チャットウィンドウのタイトルを設定
			document.querySelector('.chat-header div:first-child').textContent = branding.title;
			
			// チャットアイコンのラベルを設定
			document.querySelector('.chat-icon-label').textContent = branding.label;
	}
	
	// メッセージ送信
	function sendMessage() {
			const message = chatInput.value.trim();
			if (!message) return;
			
			// ユーザーメッセージを表示
			addUserMessage(message);
			chatInput.value = '';
			
      // テナントCのみRASAと連携、他はフロントエンドのみで処理
      if (tenantId === 'tenant_C') {
          // RASAサーバーに送信
          fetch(settings.rasaEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  sender: sessionId,
                  message: message,
                  metadata: { 
                      tenant_id: tenantId,
                      language: settings.language  // 言語情報をメタデータに追加
                  }
              })
          })
          .then(response => response.json())
          .then(data => {
              if (data && data.length > 0) {
                  data.forEach(msg => {
                      if (msg.text) {
                          addBotMessage(msg.text);
                      }
                  });
              } else {
                  addBotMessage(settings.messages.fallback);
              }
          })
          .catch(error => {
              console.error('Error:', error);
              addBotMessage(settings.language === "en" ? "A communication error occurred." : "通信エラーが発生しました。");
          });
      } else {
          // テナントA,B,defaultはフロントエンドのみで処理
          handleFrontendOnlyResponse(message, tenantId);
      }
	}
	
	// ボットメッセージの追加
	function addBotMessage(text) {
			const messageDiv = document.createElement('div');
			messageDiv.className = 'message';
			messageDiv.innerHTML = `<div class="bot-message">${text}</div>`;
			chatMessages.appendChild(messageDiv);
			chatMessages.scrollTop = chatMessages.scrollHeight;
	}
	
	// ユーザーメッセージの追加
	function addUserMessage(text) {
			const messageDiv = document.createElement('div');
			messageDiv.className = 'user-message-container';
			messageDiv.innerHTML = `<div class="user-message">${text}</div>`;
			chatMessages.appendChild(messageDiv);
			chatMessages.scrollTop = chatMessages.scrollHeight;
	}
	
	// セッションID生成
	function generateSessionId() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					const r = Math.random() * 16 | 0;
					const v = c === 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
			});
	}

  // フロントエンドのみの応答処理
  function handleFrontendOnlyResponse(message, tenantId) {
      // テナント固有の応答データ
      const responseData = {
          'default': {
              // デフォルトの応答セット
              'product': [
                  'クラウドサービスについての情報です。詳細はWebサイトをご覧ください。',
                  '当社のサービスはビジネスのあらゆるニーズに対応しています。'
              ],
              'price': [
                  '料金プランはベーシック、スタンダード、プレミアムの3種類をご用意しています。',
                  '基本料金は月額○○円から、追加機能は別途料金がかかります。'
              ],
              'support': [
                  'サポートは平日9時から18時まで対応しています。',
                  'サポートはメールまたはチャットでご利用いただけます。'
              ],
              // キーワードマッチング用
              'keywords': {
                  'サービス': 'product',
                  '製品': 'product',
                  '料金': 'price',
                  '価格': 'price',
                  'プラン': 'price',
                  'サポート': 'support',
                  '問い合わせ': 'support'
              },
              'default': '他にどのようなことをお知りになりたいですか？「製品情報」「料金プラン」「サポート情報」についてお答えできます。'
          },
          'tenant_A': {
              // ITサービス会社の応答セット
              'product': [
                  'クラウドストレージサービスについての情報です。月額500円からご利用いただけます。',
                  '当社のプロジェクト管理ツールは複数人での共同作業に最適です。'
              ],
              'price': [
                  '料金プランは個人向け、ビジネス向け、エンタープライズ向けの3種類をご用意しています。',
                  '基本料金は月額○○円から、追加機能は別途料金がかかります。'
              ],
              'support': [
                  'サポートは平日9時から17時まで対応しています。',
                  'テクニカルサポートはチャットまたはメールでご利用いただけます。'
              ],
              // キーワードマッチング用
              'keywords': {
                  'クラウド': 'product',
                  'サービス': 'product',
                  '料金': 'price',
                  '価格': 'price',
                  'プラン': 'price',
                  'サポート': 'support',
                  '問い合わせ': 'support'
              },
              'default': '他にどのようなことをお知りになりたいですか？「製品情報」「料金プラン」「サポート情報」についてお答えできます。'
          },
          'tenant_B': {
              // 旅行会社の応答セット（英語）
              'booking': [
                  'You can book a trip through our website or contact our customer service.',
                  'To make a reservation, please provide your destination and travel dates.'
              ],
              'cancel': [
                  'You can cancel your booking up to 24 hours before departure with no cancellation fee.',
                  'For cancellation, please visit our website or contact customer service.'
              ],
              'change': [
                  'Booking changes can be made through your account page.',
                  'To change your reservation, please contact our customer service.'
              ],
              // キーワードマッチング用
              'keywords': {
                  'book': 'booking',
                  'reservation': 'booking',
                  'cancel': 'cancel',
                  'refund': 'cancel',
                  'change': 'change',
                  'modify': 'change'
              },
              'default': 'How else can I help you? I can provide information about "booking", "cancellation", or "changing your reservation".'
          }
      };
      
      // 選択肢ボタン表示
      if (message.toLowerCase().includes('help') || message.includes('ヘルプ') || 
          message.toLowerCase().includes('option') || message.includes('選択')) {
          showOptions(tenantId);
          return;
      }
      
      // 応答データを取得
      const data = responseData[tenantId] || responseData['default'];
      if (!data) {
          addBotMessage(settings.messages.fallback);
          return;
      }
      
      // キーワードマッチング
      const lowerMessage = message.toLowerCase();
      let matched = false;
      
      // キーワードで検索
      for (const [keyword, category] of Object.entries(data.keywords)) {
          if (lowerMessage.includes(keyword.toLowerCase())) {
              // カテゴリに対応する応答からランダムに選択
              const responses = data[category];
              const randomResponse = responses[Math.floor(Math.random() * responses.length)];
              addBotMessage(randomResponse);
              matched = true;
              
              // 選択肢を表示（フォローアップ）
              setTimeout(() => showOptions(tenantId), 1000);
              break;
          }
      }
      
      // マッチしなかった場合はデフォルト応答
      if (!matched) {
          addBotMessage(data.default);
          showOptions(tenantId);
      }
  }

  // 選択肢ボタンを表示
  function showOptions(tenantId) {
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    
    const options = {
        'default': [
            { text: '製品情報', value: 'product' },
            { text: '料金プラン', value: 'price' },
            { text: 'サポート情報', value: 'support' },
            { text: '導入事例', value: 'cases' },
            { text: 'セキュリティ対策', value: 'security' },
            { text: '会社情報', value: 'company' },
            { text: '無料トライアル', value: 'trial' },
            { text: 'お問い合わせ方法', value: 'contact' }
        ],
        'tenant_A': [
            { text: 'クラウドストレージ', value: 'cloud' },
            { text: 'プロジェクト管理ツール', value: 'project' },
            { text: 'サブスクリプション料金', value: 'subscription' },
            { text: '一括払いオプション', value: 'onetime' },
            { text: 'テクニカルサポート', value: 'techsupport' },
            { text: 'アカウント管理', value: 'account' },
            { text: 'データ移行サービス', value: 'migration' },
            { text: 'API連携', value: 'api' },
            { text: 'エンタープライズプラン', value: 'enterprise' },
            { text: 'セキュリティ認証', value: 'certification' }
        ],
        'tenant_B': [
            { text: 'Tour Packages', value: 'packages' },
            { text: 'Booking Process', value: 'booking' },
            { text: 'Cancellation Policy', value: 'cancel' },
            { text: 'Change Reservation', value: 'change' },
            { text: 'Payment Methods', value: 'payment' },
            { text: 'Travel Insurance', value: 'insurance' },
            { text: 'Group Discounts', value: 'discount' },
            { text: 'Popular Destinations', value: 'destinations' },
            { text: 'Seasonal Offers', value: 'seasonal' },
            { text: 'Loyalty Program', value: 'loyalty' },
            { text: 'Visa Requirements', value: 'visa' }
        ]
    };
    
    const tenantOptions = options[tenantId] || options['default'];
    
    tenantOptions.forEach(option => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option.text;
        button.addEventListener('click', function() {
            // 選択したオプションをユーザーメッセージとして表示
            addUserMessage(option.text);
            
            // 選択に応じた応答を表示
            const responseData = {
                'default': {
                    'product': [
                        'クラウドサービスについての情報をご案内します。当社のクラウドサービスは、高速なアクセス速度と99.9%の稼働率を保証しています。データバックアップも自動で行われるため安心してご利用いただけます。その他に何かご質問はありますか？',
                        '当社のサービスはビジネスのあらゆるニーズに対応しています。リアルタイムコラボレーション機能、カスタマイズ可能なダッシュボード、各種システムとのAPI連携など、業務効率化をサポートする機能を豊富に取り揃えています。他にお知りになりたい点はございますか？'
                    ],
                    'price': [
                        '料金プランはベーシック（月額1,000円～）、スタンダード（月額3,000円～）、プレミアム（月額10,000円～）の3種類をご用意しています。各プランの詳細は公式サイトでご確認いただけます。他に何かお手伝いできることはありますか？',
                        '基本料金は月額1,000円から、ユーザー数やストレージ容量に応じて追加料金が発生します。年間契約の場合は2ヶ月分無料になるお得なプランもございます。その他にご質問はありますか？'
                    ],
                    'support': [
                        'サポートは平日9時から18時まで、電話、メール、チャットにて対応しています。プレミアムプランをご契約のお客様は24時間365日のサポートをご利用いただけます。他にお知りになりたいことはありますか？',
                        'テクニカルサポートは専門のエンジニアチームが対応いたします。一般的な操作方法から技術的な問題まで幅広くサポートしております。また、オンラインマニュアルやFAQも充実していますので、ご活用ください。他にご質問はありますか？'
                    ],
                    'cases': [
                        '導入事例として、大手製造業A社様では当社のサービス導入後、業務効率が35%向上し、年間約2,000万円のコスト削減に成功されました。詳細な事例はウェブサイトでご紹介しています。その他に何かお知りになりたいことはございますか？',
                        '金融、製造、小売、医療など様々な業界のお客様にご利用いただいています。特に中堅企業を中心に1,000社以上の導入実績があります。業種別の事例についてはお問い合わせください。他にご質問はありますか？'
                    ],
                    'security': [
                        '当社のセキュリティ対策には、AES-256ビット暗号化、多要素認証、定期的なセキュリティ監査などが含まれています。また、ISO 27001およびSOC 2 Type IIの認証も取得しており、安心してご利用いただけます。他に何かご質問はありますか？',
                        'お客様のデータを守るため、最新のセキュリティ技術を採用しています。データセンターは24時間体制で監視され、物理的なセキュリティも万全です。プライバシーポリシーについても詳しくご説明できますが、いかがでしょうか？'
                    ],
                    'company': [
                        '当社は2010年の創業以来、クラウドサービスのパイオニアとして成長してまいりました。現在は東京、大阪、福岡にオフィスを構え、従業員数は約200名です。他にお知りになりたい点はございますか？',
                        '株式会社サンプルは、「テクノロジーで世界をシンプルに」というミッションのもと、革新的なソリューションを提供しています。昨年度の売上高は約30億円で、成長を続けています。その他に何かご質問はありますか？'
                    ],
                    'trial': [
                        '無料トライアルは30日間ご利用いただけます。クレジットカード情報なしでお申し込みいただけ、すべての機能をお試しいただけます。トライアル終了後も自動更新されることはありませんのでご安心ください。他にご質問はありますか？',
                        '無料トライアルのお申し込みは公式サイトから簡単に行えます。メールアドレスを登録するだけで、すぐにサービスを始められます。トライアル期間中も専任のサポートスタッフがご質問にお答えします。その他に何かお知りになりたいことはありますか？'
                    ],
                    'contact': [
                        'お問い合わせは、メール（info@example.com）、電話（0120-XXX-XXX）、またはウェブサイトのお問い合わせフォームからお願いいたします。平日9時から18時まで、専門スタッフが対応しております。他に何かご質問はありますか？',
                        '営業担当者との直接のご相談をご希望の場合は、ウェブサイトから面談予約が可能です。オンラインミーティングまたは対面でのご説明も承っております。その他にお知りになりたいことはございますか？'
                    ]
                },
                'tenant_A': {
                    'cloud': [
                        'クラウドストレージサービスは、最大10TBまでのデータを安全に保存できます。自動バックアップ機能、バージョン管理、アクセス権限の詳細設定など、ビジネスに必要な機能を全て備えています。データ暗号化にも対応しているため、機密情報も安心して保存できます。その他に何かご質問はありますか？',
                        '当社のクラウドストレージは、複数のデバイスからアクセス可能で、いつでもどこでも最新のファイルを利用できます。大容量ファイルの転送も高速で、業界最速レベルのアップロード・ダウンロード速度を誇ります。他にお知りになりたいことはございますか？'
                    ],
                    'project': [
                        'プロジェクト管理ツールは、タスク管理、ガントチャート、リソース配分、ドキュメント共有などの機能を統合しています。チーム全体の進捗を可視化し、締め切りを守るためのリマインダー機能も搭載しています。さらに詳しい機能についてお知りになりたいことはありますか？',
                        '複数のプロジェクトを並行して管理でき、カスタマイズ可能なワークフローで様々な業種・プロジェクトタイプに対応します。また、Slack、Microsoft Teams、Googleカレンダーなどの外部サービスとの連携も豊富です。他にご質問はありますか？'
                    ],
                    'subscription': [
                        'サブスクリプション料金は、ユーザー数に基づいて月額500円/人から設定しています。毎月自動更新され、いつでもアップグレードまたはダウングレードが可能です。年間プランでご契約いただくと、2ヶ月分無料になるお得なオプションもございます。その他にお知りになりたいことはありますか？',
                        'サブスクリプションには基本プラン（500円/月/人）、ビジネスプラン（1,500円/月/人）、エンタープライズプラン（3,000円/月/人）の3つのレベルがあり、機能やストレージ容量が異なります。契約期間中の解約にはキャンセルポリシーが適用されます。他に何かご質問はありますか？'
                    ],
                    'onetime': [
                        '一括払いオプションは、長期利用を前提としたお客様向けのプランです。1年分、3年分、5年分のライセンスを一括でご購入いただくと、最大30%の割引が適用されます。予算計画が立てやすいのがメリットです。その他にご質問はありますか？',
                        '一括払いプランでは、契約期間中のアップデートやセキュリティパッチが無料で提供されます。また、優先サポートやカスタマイズオプションの割引も特典として含まれています。他にお知りになりたいことはございますか？'
                    ],
                    'techsupport': [
                        'テクニカルサポートは、メール、チャット、電話にて平日9時から17時まで対応しています。プレミアムサポートプランでは24時間365日の対応も可能です。対応言語は日本語と英語です。他に何かご質問はありますか？',
                        '専任のサポートエンジニアがシステムの設定や技術的な問題解決をサポートします。また、毎月のウェビナーや技術ドキュメントも提供しており、ユーザーの皆様の技術力向上もお手伝いしています。その他にお知りになりたいことはございますか？'
                    ],
                    'account': [
                        'アカウント管理では、ユーザーの追加・削除、権限設定、二要素認証の設定、アクセスログの確認などが可能です。管理者は組織全体のアクティビティを監視し、セキュリティポリシーを適用できます。他にご質問はありますか？',
                        'シングルサインオン（SSO）との連携も可能で、Active Directory、Google Workspace、Oktaなどの認証システムと統合できます。ユーザーグループを作成して一括で権限を管理することもできます。その他に何かお知りになりたいことはありますか？'
                    ],
                    'migration': [
                        'データ移行サービスでは、既存システムからのスムーズな移行をサポートします。専任のエンジニアがデータのマッピング、変換、検証を行い、ダウンタイムを最小限に抑えたマイグレーションを実施します。詳細な移行計画も提供しています。他に何かご質問はありますか？',
                        '主要なクラウドサービスやオンプレミスシステムからの移行に対応しています。データの整合性を保ちながら、メタデータやユーザー権限なども含めて移行します。移行後の検証や調整も含まれています。その他にお知りになりたいことはございますか？'
                    ],
                    'api': [
                        'API連携は、RESTful APIとWebhookを通じて実現できます。詳細なAPI仕様書とサンプルコードを提供しており、独自のインテグレーションを開発可能です。主要な操作はすべてAPIを通じて自動化できます。他にご質問はありますか？',
                        '当社のAPIを使用すると、Salesforce、SAP、Workdayなどの主要なビジネスシステムとの連携が可能です。データの双方向同期やイベントトリガーによる自動処理を設定できます。API利用の制限は、契約プランによって異なります。その他に何かお知りになりたいことはありますか？'
                    ],
                    'enterprise': [
                        'エンタープライズプランは、大規模な組織向けに設計されたソリューションです。専用インスタンス、カスタムSLA、優先サポート、セキュリティ強化オプションが含まれています。料金は組織規模に応じてカスタマイズされます。他に何かご質問はありますか？',
                        'エンタープライズレベルのコンプライアンス対応（GDPR、HIPAA、PCI DSSなど）、専任のカスタマーサクセスマネージャー、定期的な業務レビュー、トレーニングプログラムなどのサービスが含まれています。特定の業界向けの機能も用意しています。その他にお知りになりたいことはございますか？'
                    ],
                    'certification': [
                        'セキュリティ認証としては、ISO 27001、SOC 2 Type II、CSA STARなどを取得しています。定期的な第三者による監査を実施し、最新のセキュリティ基準を満たしていることを確認しています。監査レポートはお客様にもご提供可能です。他にご質問はありますか？',
                        'データプライバシーについては、GDPR、CCPA、APPIに準拠しており、お客様のデータ保護に最大限の注意を払っています。データ処理に関する透明性を確保し、お客様の権利を尊重しています。その他に何かお知りになりたいことはありますか？'
                    ]
                },
                'tenant_B': {
                    'packages': [
                        'We offer a variety of tour packages ranging from city breaks to extensive multi-country tours. Our most popular packages include European Highlights (10 days), Asian Adventure (14 days), and American Road Trip (12 days). Each package includes accommodation, transportation, and guided tours. Is there anything else you would like to know?',
                        'Our tour packages are designed for different types of travelers - families, couples, solo travelers, and adventure seekers. We also offer customizable packages where you can pick and choose specific destinations and activities. Do you have any specific preferences for your trip?'
                    ],
                    'booking': [
                        'The booking process is simple: select your desired tour on our website, choose your dates, provide traveler information, and complete the payment. You will receive an instant confirmation email with all the details. Our customer service team is available to assist you at any step. Is there anything else you would like to know?',
                        'You can book a trip through our website, mobile app, or by contacting our customer service directly. We require a 20% deposit to confirm your booking, with the remaining balance due 30 days before departure. Would you like me to explain any specific part of the booking process in more detail?'
                    ],
                    'cancel': [
                        'Our cancellation policy allows free cancellation up to 30 days before departure. Cancellations made 15-29 days before departure incur a 50% fee, while those made less than 15 days before departure are non-refundable. We recommend purchasing travel insurance for added protection. Is there anything else you would like to know?',
                        'To cancel a booking, you can do so through your account on our website or by contacting our customer service. If you need to cancel due to emergency circumstances, we may offer more flexible terms on a case-by-case basis. Would you like information about our travel insurance options that cover cancellations?'
                    ],
                    'change': [
                        'Booking changes can be made through your online account or by contacting our customer service. Date changes made more than 30 days before departure are free of charge. Changes to destinations or tour packages may incur additional fees depending on price differences. Would you like to know more about our change policy?',
                        'To modify your reservation, log in to your account, select the booking you wish to change, and click on the "Modify Booking" option. You can change dates, add travelers, or upgrade your package. Changes are subject to availability and may affect the total price. Is there anything else you would like to know?'
                    ],
                    'payment': [
                        'We accept various payment methods including credit/debit cards (Visa, Mastercard, American Express), PayPal, bank transfers, and in some regions, digital wallets like Apple Pay and Google Pay. Payments are processed securely with encryption technology. Do you have any other questions about payment options?',
                        'For your convenience, we offer payment plans for bookings made more than 60 days in advance. You can pay in up to three installments with no additional fees. Corporate clients can also arrange for invoice payments with pre-approved credit terms. Is there anything else you would like to know about our payment methods?'
                    ],
                    'insurance': [
                        'Travel insurance is highly recommended and can be added during the booking process. Our comprehensive policy covers trip cancellation, medical emergencies, lost baggage, travel delays, and COVID-19 related issues. Prices start from $5 per day, depending on your trip duration and destination. Would you like more details about our insurance coverage?',
                        'Our premium insurance package includes additional benefits such as adventure activity coverage, higher medical expense limits, and rental car damage protection. Senior travelers (65+) may have specific policy terms and rates. We partner with reputable global insurance providers to ensure quality service. Do you have any specific questions about travel insurance?'
                    ],
                    'discount': [
                        'Group discounts are available for parties of 6 or more travelers booking the same tour. The discount ranges from 10% to 15% depending on group size. To qualify, all travelers must be booked under a single reservation. Would you like me to explain how to arrange a group booking?',
                        'Besides group discounts, we offer early bird specials (up to 20% off when booking 6 months in advance), last-minute deals, and seasonal promotions. We also have a loyalty program where you earn points on every booking that can be redeemed for discounts on future trips. Is there anything else you would like to know about our discount options?'
                    ],
                    'destinations': [
                        'Our most popular destinations include Paris, Tokyo, New York, Bali, and Barcelona. Each destination offers unique cultural experiences, landmark attractions, and culinary delights. Our website features detailed guides for each location, including best times to visit and local recommendations. Is there a particular destination you\'re interested in?',
                        'We currently operate tours in over 50 countries across 6 continents. Our destination specialists can provide insights on less-traveled locations that might suit your interests, such as Slovenia in Europe, Laos in Asia, or Uruguay in South America. Is there a specific region you\'re looking to explore?'
                    ],
                    'seasonal': [
                        'We offer seasonal promotions throughout the year, such as Cherry Blossom tours in Japan (Spring), European Christmas Markets (Winter), and Fall Foliage tours in New England (Autumn). These special tours are designed to showcase destinations at their most beautiful times. Would you like information about our current seasonal offers?',
                        'Our seasonal offers include up to 25% discounts on selected destinations during shoulder seasons. We also create special themed tours for major events like Carnival in Rio, Oktoberfest in Munich, or the Northern Lights in Scandinavia. These tours often sell out quickly, so early booking is recommended. Is there a particular season or event you\'re interested in?'
                    ],
                    'loyalty': [
                        'Our Traveler Rewards loyalty program lets you earn points on every booking. Points can be redeemed for discounts, upgrades, or exclusive experiences. Members also receive early access to new tours, free airport transfers, and priority customer service. Would you like to know how to join our loyalty program?',
                        'There are three tiers in our loyalty program: Silver, Gold, and Platinum. Benefits increase with each tier and include perks like room upgrades, flexible cancellation terms, and exclusive member events. Your tier is determined by your travel frequency or spending with us over a 12-month period. Is there anything specific about the loyalty program you\'d like to know more about?'
                    ],
                    'visa': [
                        'Visa requirements vary depending on your nationality and destination. We provide general information about visa needs for each tour on our website, but we recommend checking with the relevant embassy or consulate for the most up-to-date requirements. Would you like information about visa services we can recommend?',
                        'While we don\'t directly process visa applications, we provide all necessary documentation to support your application, such as confirmed hotel bookings and tour itineraries. For select destinations, we partner with visa service providers who can assist with the application process for an additional fee. Is there a specific country\'s visa requirements you\'d like to know about?'
                    ]
                }
            };
            
            const responses = responseData[tenantId][option.value];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addBotMessage(randomResponse);
            
            // 選択肢を削除
            optionsContainer.remove();
            
            // 少し待ってから新しい選択肢を表示
            setTimeout(() => showOptions(tenantId), 1000);
        });
        optionsContainer.appendChild(button);
    });
    
    chatMessages.appendChild(optionsContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});