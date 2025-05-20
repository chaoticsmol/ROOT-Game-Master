# Root Game Master

This is an OpenAI-driven assistant that answers questions about the ROOT board game.

## Disclaimers

This is, inherently, a highly personalized project. It's not designed to be deployed
or readily used by others.  With a little setup, it can be, though.

I don't have any code for creating the vector store automatically. You will have to upload the files
in the `resources/` folder to one yourself.

## Rights

All of the contents of the `resources/` directory are property of
[Leder Games](https://ledergames.com/pages/resources).

This code is [licensed](#LICENSE) under the GPL v3.0.  Especially given that most of this code was
LLM-generated, I ask that you please use this work respectfully and considerately.

The image of the Game Master was also generated with OpenAI.  PLEASE PAY REAL ARTISTS IF YOU CAN.

## Setup

1. Modify your `configuration.ts` file.

```json
{
  "vectorStoreId": "id of the vector store you create" 
}
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file containing your OpenAI API key
```
VITE_OPENAI_API_KEY=your-api-key-here
```

## Development

- Build the project
```bash
npm run build
```

- Run the built project:
```bash
npm start
```