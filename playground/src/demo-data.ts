import LZString from 'lz-string';

/**
 * Create a valid rrweb v2 demo session for Playground testing.
 *
 * Key rules:
 *   - Every node in FullSnapshot MUST have an `id` field (numeric)
 *   - IncrementalSource values match rrweb v2 enum:
 *     Mutation=0, MouseMove=1, MouseInteraction=2, Scroll=3, Input=5
 *   - MouseInteraction data has x/y as direct fields (not in position sub-object)
 *   - EventType: Meta=4, FullSnapshot=2, IncrementalSnapshot=3
 */
function createDemoSession(): string {
  const events = [
    // ── Meta event (type: 4) ──
    {
      timestamp: 1700000000,
      type: 4,
      data: {
        href: 'https://example.com',
        width: 1280,
        height: 720,
      },
    },

    // ── FullSnapshot event (type: 2) ──
    // Every node has an `id` field for the Replayer to reference
    {
      timestamp: 1700000001,
      type: 2,
      data: {
        node: {
          type: 0,          // NodeType.Document
          id: 0,
          childNodes: [
            {
              type: 1,      // NodeType.DocumentType
              id: 1,
              name: 'html',
              publicId: '',
              systemId: '',
            },
            {
              type: 2,      // NodeType.Element — <html>
              id: 2,
              tagName: 'html',
              attributes: {},
              childNodes: [
                {
                  type: 2,  // NodeType.Element — <head>
                  id: 3,
                  tagName: 'head',
                  attributes: {},
                  childNodes: [],
                },
                {
                  type: 2,  // NodeType.Element — <body>
                  id: 4,
                  tagName: 'body',
                  attributes: {},
                  childNodes: [
                    {
                      type: 2, // NodeType.Element — <div id="app">
                      id: 5,
                      tagName: 'div',
                      attributes: { id: 'app' },
                      childNodes: [
                        {
                          type: 2, // NodeType.Element — <h1>
                          id: 6,
                          tagName: 'h1',
                          attributes: {},
                          childNodes: [
                            {
                              type: 3, // NodeType.Text
                              id: 7,
                              textContent: 'Welcome to Example',
                            },
                          ],
                        },
                        {
                          type: 2, // NodeType.Element — <button id="login-btn">
                          id: 8,
                          tagName: 'button',
                          attributes: { id: 'login-btn', class: 'btn-primary' },
                          childNodes: [
                            {
                              type: 3, // NodeType.Text
                              id: 9,
                              textContent: 'Login',
                            },
                          ],
                        },
                        {
                          type: 2, // NodeType.Element — <input id="search">
                          id: 10,
                          tagName: 'input',
                          attributes: { id: 'search', type: 'text', placeholder: 'Search...' },
                          childNodes: [],
                        },
                        {
                          type: 2, // NodeType.Element — <p>
                          id: 11,
                          tagName: 'p',
                          attributes: {},
                          childNodes: [
                            {
                              type: 3, // NodeType.Text
                              id: 12,
                              textContent: 'Some content below the header.',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        initialOffset: { top: 0, left: 0 },
      },
    },

    // ── Incremental events (type: 3) ──
    // Source values use rrweb v2 IncrementalSource enum:
    //   MouseInteraction = 2, Scroll = 3, MouseMove = 1, Input = 5

    // Click on button (id: 8)
    {
      timestamp: 1700001000,
      type: 3,
      data: {
        source: 2,               // IncrementalSource.MouseInteraction
        type: 2,                 // MouseInteractionType.Click
        id: 8,                   // target node id (the button)
        x: 500,
        y: 300,
      },
    },

    // Scroll down
    {
      timestamp: 1700002000,
      type: 3,
      data: {
        source: 3,               // IncrementalSource.Scroll
        id: 4,                   // scrolling node id (body)
        x: 0,
        y: 200,
      },
    },

    // Input text change
    {
      timestamp: 1700003000,
      type: 3,
      data: {
        source: 5,               // IncrementalSource.Input
        id: 10,                  // target node id (the input)
        text: 'hello',
        isChecked: false,
      },
    },

    // Another click on button (id: 8) — same position for heatmap aggregation test
    {
      timestamp: 1700004000,
      type: 3,
      data: {
        source: 2,               // IncrementalSource.MouseInteraction
        type: 2,                 // MouseInteractionType.Click
        id: 8,
        x: 500,
        y: 300,
      },
    },

    // Mouse move
    {
      timestamp: 1700005000,
      type: 3,
      data: {
        source: 1,               // IncrementalSource.MouseMove
        positions: [
          { x: 600, y: 400, timeOffset: 0 },
          { x: 650, y: 350, timeOffset: 100 },
        ],
      },
    },

    // Click at slightly different position
    {
      timestamp: 1700006000,
      type: 3,
      data: {
        source: 2,               // IncrementalSource.MouseInteraction
        type: 2,                 // MouseInteractionType.Click
        id: 8,
        x: 520,
        y: 310,
      },
    },

    // Scroll down more
    {
      timestamp: 1700007000,
      type: 3,
      data: {
        source: 3,               // IncrementalSource.Scroll
        id: 4,
        x: 0,
        y: 400,
      },
    },

    // Input text update
    {
      timestamp: 1700008000,
      type: 3,
      data: {
        source: 5,               // IncrementalSource.Input
        id: 10,
        text: 'hello world',
        isChecked: false,
      },
    },
  ];

  return JSON.stringify(events);
}

/** LZ-String URI-safe compressed demo data (most common format for URL embedding) */
export const DEMO_DATA_URI = LZString.compressToEncodedURIComponent(createDemoSession());

/** LZ-String UTF-16 compressed demo data (common for localStorage) */
export const DEMO_DATA_UTF16 = LZString.compressToUTF16(createDemoSession());

/** Raw JSON (uncompressed — tests the Raw format detection path) */
export const DEMO_DATA_RAW = createDemoSession();
